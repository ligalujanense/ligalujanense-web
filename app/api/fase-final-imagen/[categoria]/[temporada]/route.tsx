import { ImageResponse } from "next/og";
import { createAdminClient } from "@/lib/supabase/admin";
import { LIGA_LOGO, CLUB_LOGOS } from "@/lib/baked-assets.generated";
import { BloqueSponsors } from "@/lib/og-sponsors";
import { imagenConCache } from "@/lib/og-cache";
import { encontrarCategoria } from "@/lib/torneos";
import { cargarCuadro } from "@/lib/fase-final-data";
import type { ClubFF, CruceResuelto } from "@/lib/fase-final";

export const maxDuration = 30;

const CREMA = "#F7F5F0";
const CELESTE = "#0E7FAE";
const DORADO = "#B5842E";

// Lienzo y círculo
const W = 1080;
const H = 1920;
const CX = 540;
const CY = 885;
const KY = 1; // 1 = círculo perfecto
const R_OUT = 420; // clubes del borde
const R_L2 = 318; // ganadores de la 1ª fase (y Perdedor Final Anual)
const R_L1 = 228; // ganadores de la 2ª fase
const R_L0 = 142; // ganadores de semifinal
const DELTA = 9; // separación angular de los dos clubes de un cruce

const rad = (g: number) => (g * Math.PI) / 180;
const pol = (r: number, g: number): [number, number] => [
  CX + r * Math.cos(rad(g)),
  CY + KY * r * Math.sin(rad(g)),
];

type Nodo = {
  id: string;
  r: number;
  ang: number;
  size: number;
  club: ClubFF | null;
  dim: boolean;
  /** id del nodo hacia el que va la línea (null = centro). */
  padre: string | null;
  /** Línea resaltada: este club avanza. */
  activo: boolean;
};

function Escudo({ club, size }: { club: ClubFF; size: number }) {
  const logo = CLUB_LOGOS[club.id] ?? null;
  return logo ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={logo} width={size} height={size} style={{ objectFit: "contain" }} alt="" />
  ) : (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size,
        background: "rgba(14,127,174,0.12)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.45,
        fontWeight: 700,
        color: CELESTE,
      }}
    >
      {club.nombre.charAt(0)}
    </div>
  );
}

/** Camino de un nodo hacia su padre: radial hacia adentro y luego en arco. */
function camino(n: Nodo, padre: { r: number; ang: number }): string {
  const [x1, y1] = pol(n.r, n.ang);
  if (padre.r === 0) return `M ${x1.toFixed(1)} ${y1.toFixed(1)} L ${CX} ${CY}`;
  const [x2, y2] = pol(padre.r, n.ang);
  const [x3, y3] = pol(padre.r, padre.ang);
  const sweep = padre.ang > n.ang ? 1 : 0;
  const arco =
    Math.abs(padre.ang - n.ang) < 0.01
      ? ""
      : ` A ${padre.r} ${(padre.r * KY).toFixed(1)} 0 0 ${sweep} ${x3.toFixed(1)} ${y3.toFixed(1)}`;
  return `M ${x1.toFixed(1)} ${y1.toFixed(1)} L ${x2.toFixed(1)} ${y2.toFixed(1)}${arco}`;
}

function armarNodos(cruces: CruceResuelto[]): Nodo[] {
  const por = new Map(cruces.map((c) => [c.codigo, c]));
  const perdio = (club: ClubFF | null, codigo: string) =>
    !!club && por.get(codigo)?.perdedor?.id === club.id;
  const nodos: Nodo[] = [];

  // Ocho lugares de la 2ª Fase, en el orden en que se ubican alrededor del círculo.
  type Lugar =
    | { tipo: "directo"; cruce: string; lado: "a" | "b" }
    | { tipo: "ganador"; cruce: string }
    | { tipo: "perdedorFA" };
  const lugares: Lugar[] = [
    { tipo: "directo", cruce: "b", lado: "a" },
    { tipo: "ganador", cruce: "1" },
    { tipo: "ganador", cruce: "4" },
    { tipo: "perdedorFA" },
    { tipo: "ganador", cruce: "3" },
    { tipo: "directo", cruce: "d", lado: "b" },
    { tipo: "directo", cruce: "c", lado: "a" },
    { tipo: "ganador", cruce: "2" },
  ];
  const cruceDe2daFase = ["b", "b", "a", "a", "d", "d", "c", "c"];
  const angs2da = [-67.5, -22.5, 22.5, 67.5, 112.5, 157.5, 202.5, 247.5];

  lugares.forEach((l, j) => {
    const ang = angs2da[j];
    const padre = cruceDe2daFase[j];
    const cPadre = por.get(padre);
    const id = `s${j}`;

    if (l.tipo === "directo") {
      const club = (l.lado === "a" ? cPadre?.a : cPadre?.b) ?? null;
      if (!club) return;
      nodos.push({
        id, r: R_OUT, ang, size: 88, club,
        dim: perdio(club, padre), padre: `f2-${padre}`, activo: true,
      });
      return;
    }

    if (l.tipo === "perdedorFA") {
      const fa = por.get("FA");
      const club = fa?.perdedor ?? null;
      nodos.push({
        id, r: R_L2, ang, size: 80, club,
        dim: perdio(club, padre), padre: `f2-${padre}`, activo: !!club,
      });
      if (fa) {
        [fa.a, fa.b].forEach((k, i) => {
          if (!k) return;
          nodos.push({
            id: `${id}-${i}`, r: R_OUT, ang: ang + (i === 0 ? -DELTA : DELTA), size: 88, club: k,
            dim: false, padre: id, activo: fa.perdedor?.id === k.id,
          });
        });
      }
      return;
    }

    // ganador de un cruce de 1ª Fase
    const c = por.get(l.cruce);
    const club = c?.ganador ?? null;
    nodos.push({
      id, r: R_L2, ang, size: 80, club,
      dim: perdio(club, padre), padre: `f2-${padre}`, activo: !!club,
    });
    if (c) {
      [c.a, c.b].forEach((k, i) => {
        if (!k) return;
        nodos.push({
          id: `${id}-${i}`, r: R_OUT, ang: ang + (i === 0 ? -DELTA : DELTA), size: 88, club: k,
          dim: perdio(k, c.codigo), padre: id, activo: c.ganador?.id === k.id,
        });
      });
    }
  });

  // Ganadores de 2ª Fase (b, a, d, c) y de semifinales (X, Y)
  const ang2 = (a: number, b: number) => (a + b) / 2;
  const f2: [string, number, string][] = [
    ["b", ang2(angs2da[0], angs2da[1]), "X"],
    ["a", ang2(angs2da[2], angs2da[3]), "X"],
    ["d", ang2(angs2da[4], angs2da[5]), "Y"],
    ["c", ang2(angs2da[6], angs2da[7]), "Y"],
  ];
  for (const [cod, ang, semi] of f2) {
    const club = por.get(cod)?.ganador ?? null;
    nodos.push({
      id: `f2-${cod}`, r: R_L1, ang, size: 74, club,
      dim: perdio(club, semi), padre: `sf-${semi}`, activo: !!club,
    });
  }
  const angX = ang2(f2[0][1], f2[1][1]);
  const angY = ang2(f2[2][1], f2[3][1]);
  for (const [cod, ang] of [["X", angX], ["Y", angY]] as [string, number][]) {
    const club = por.get(cod)?.ganador ?? null;
    nodos.push({
      id: `sf-${cod}`, r: R_L0, ang, size: 68, club,
      dim: perdio(club, "F"), padre: null, activo: !!club,
    });
  }
  return nodos;
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ categoria: string; temporada: string }> }
) {
  const { categoria, temporada } = await ctx.params;
  const cat = encontrarCategoria(categoria);
  if (!cat || !cat.temporadas.includes(temporada)) {
    return new Response("No encontrado", { status: 404 });
  }

  const { cruces } = await cargarCuadro(createAdminClient(), cat.slug, temporada);
  if (cruces.length === 0) return new Response("Sin cruces", { status: 404 });

  const nodos = armarNodos(cruces);
  const porId = new Map(nodos.map((n) => [n.id, n]));
  const campeon = cruces.find((c) => c.codigo === "F")?.ganador ?? null;

  // Posición de cada nodo (padre) para trazar las líneas.
  const destino = (n: Nodo) => {
    if (n.padre === null) return { r: 0, ang: 0 };
    const p = porId.get(n.padre);
    return p ? { r: p.r, ang: p.ang } : { r: 0, ang: 0 };
  };

  const lineas = nodos.map((n) => ({ d: camino(n, destino(n)), activo: n.activo }));
  const inactivas = lineas.filter((l) => !l.activo);
  const activas = lineas.filter((l) => l.activo);

  const huella = cruces.map((c) => ({
    c: c.codigo, a: c.a?.id, b: c.b?.id, w: c.ganador?.id, l: c.perdedor?.id,
  }));

  return imagenConCache({
    carpeta: "fase-final",
    clave: `${cat.slug}-${temporada}`,
    datos: huella,
    cacheControl: "public, max-age=0, s-maxage=30, must-revalidate",
    dibujar: () =>
      new ImageResponse(
        (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              position: "relative",
              background: CREMA,
            }}
          >
            {/* Tarjeta blanca (como en fixture y posiciones) */}
            <div
              style={{
                position: "absolute",
                left: 48,
                right: 48,
                top: 340,
                height: 1090,
                background: "#ffffff",
                borderRadius: 36,
              }}
            />

            {/* Líneas */}
            <svg
              width={W}
              height={H}
              viewBox={`0 0 ${W} ${H}`}
              style={{ position: "absolute", left: 0, top: 0 }}
            >
              {inactivas.map((l, i) => (
                <path key={`i${i}`} d={l.d} fill="none" stroke="#d8d1c2" strokeWidth={3} strokeLinecap="round" />
              ))}
              {activas.map((l, i) => (
                <path key={`a${i}`} d={l.d} fill="none" stroke={CELESTE} strokeWidth={5} strokeLinecap="round" />
              ))}
            </svg>

            {/* Encabezado */}
            <div
              style={{
                position: "absolute",
                top: 56,
                left: 48,
                right: 48,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span
                  style={{
                    fontSize: 38,
                    fontWeight: 700,
                    letterSpacing: 5,
                    color: DORADO,
                    textTransform: "uppercase",
                  }}
                >
                  Fase final
                </span>
                <span style={{ fontSize: 104, fontWeight: 800, color: CELESTE, lineHeight: 1.02 }}>
                  {temporada}
                </span>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={LIGA_LOGO} width={168} height={185} style={{ objectFit: "contain" }} alt="" />
            </div>

            {/* Escudos y puntos vacíos */}
            {nodos.map((n) => {
              const [x, y] = pol(n.r, n.ang);
              return (
                <div key={n.id} style={{ display: "flex" }}>
                  <div
                    style={{
                      position: "absolute",
                      left: x - n.size / 2,
                      top: y - n.size / 2,
                      width: n.size,
                      height: n.size,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: n.dim ? 0.3 : 1,
                    }}
                  >
                    {n.club ? (
                      <Escudo club={n.club} size={n.size} />
                    ) : (
                      <div
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: 30,
                          background: CREMA,
                          border: "4px solid #cfc8b8",
                        }}
                      />
                    )}
                  </div>
                </div>
              );
            })}

            {/* Centro: escudo de la liga o del campeón */}
            <div
              style={{
                position: "absolute",
                left: CX - 80,
                top: CY - 80,
                width: 160,
                height: 160,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {campeon ? (
                <Escudo club={campeon} size={160} />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={LIGA_LOGO} width={120} height={132} style={{ objectFit: "contain" }} alt="" />
              )}
            </div>

            {/* Sponsors */}
            <div
              style={{
                position: "absolute",
                left: 48,
                right: 48,
                bottom: 44,
                display: "flex",
                flexDirection: "column",
                background: "#ffffff",
                borderRadius: 36,
                padding: "6px 24px 34px",
              }}
            >
              <BloqueSponsors />
            </div>
          </div>
        ),
        { width: W, height: H }
      ),
  });
}

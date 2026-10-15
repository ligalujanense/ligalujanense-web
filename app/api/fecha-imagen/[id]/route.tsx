import { ImageResponse } from "next/og";
import { createAdminClient } from "@/lib/supabase/admin";
import { LIGA_LOGO, CLUB_LOGOS } from "@/lib/baked-assets.generated";
import { BloqueSponsors } from "@/lib/og-sponsors";
import { diaLargo, diaPartes } from "@/lib/dias";

// Vercel: margen de tiempo para renderizar la imagen (el default son 10 s).
export const maxDuration = 30;

const CREMA = "#F7F5F0";
const CELESTE = "#0E7FAE";
const DORADO = "#B5842E";
const GRIS = "#737373";

type P = {
  /** Día de ESTE partido (los de una misma fecha se juegan en días distintos). */
  dia: string | null;
  /** Para el diseño grande de un solo partido: "SÁBADO" y "17 de Octubre". */
  diaSemana: string | null;
  diaResto: string | null;
  libre: string | null;
  localNombre: string;
  localLogo: string | null;
  visitanteNombre: string;
  visitanteLogo: string | null;
  estado: string;
  resultadoLocal: number | null;
  resultadoVisitante: number | null;
  hora: string | null;
  estadio: string | null;
};

function medidas(n: number) {
  if (n <= 1) return { escudo: 310, nombre: 50, marcador: 88, col: 340, centro: 280 };
  if (n <= 2) return { escudo: 190, nombre: 42, marcador: 66, col: 380, centro: 200 };
  if (n === 3) return { escudo: 160, nombre: 37, marcador: 58, col: 380, centro: 190 };
  if (n === 4) return { escudo: 128, nombre: 31, marcador: 48, col: 370, centro: 180 };
  return { escudo: 100, nombre: 26, marcador: 40, col: 355, centro: 170 };
}

function Equipo({
  nombre,
  logo,
  m,
}: {
  nombre: string;
  logo: string | null;
  m: ReturnType<typeof medidas>;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: m.col,
      }}
    >
      {logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logo}
          width={m.escudo}
          height={m.escudo}
          style={{ objectFit: "contain" }}
          alt=""
        />
      ) : (
        <div
          style={{
            width: m.escudo,
            height: m.escudo,
            borderRadius: m.escudo,
            background: "rgba(14,127,174,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: m.escudo * 0.4,
            fontWeight: 700,
            color: CELESTE,
          }}
        >
          {nombre.charAt(0)}
        </div>
      )}
      <div
        style={{ display: "flex", justifyContent: "center", width: m.col, marginTop: 14 }}
      >
        <span
          style={{
            fontSize: m.nombre,
            fontWeight: 700,
            color: CELESTE,
            textAlign: "center",
            lineHeight: 1.15,
          }}
        >
          {nombre}
        </span>
      </div>
    </div>
  );
}

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  // ?partido=<id> -> imagen de UN solo partido de la fecha (mismo diseño y sponsors).
  const soloPartido = new URL(req.url).searchParams.get("partido");
  const supabase = createAdminClient();

  const { data: fecha } = await supabase
    .from("fixture_fechas")
    .select(
      `numero_fecha, fecha, zonas ( nombre ),
       partidos (
         id, fecha, hora, estadio, estado, resultado_local, resultado_visitante,
         equipo_local:equipo_local_id ( club_id, clubes ( nombre ) ),
         equipo_visitante:equipo_visitante_id ( club_id, clubes ( nombre ) ),
         libre_equipo:libre_equipo_id ( clubes ( nombre ) )
       )`
    )
    .eq("id", id)
    .single();

  if (!fecha) return new Response("Fecha no encontrada", { status: 404 });

  const f = fecha as any;
  const zonaNombre: string = f.zonas?.nombre ?? "";
  const numeroFecha: number = f.numero_fecha;

  const partidos: P[] = (f.partidos ?? [])
    .filter((p: any) => !soloPartido || p.id === soloPartido)
    .sort(
      (a: any, b: any) =>
        (a.fecha ?? "9").localeCompare(b.fecha ?? "9") ||
        (a.hora ?? "").localeCompare(b.hora ?? "")
    )
    .map((p: any) => ({
    dia: diaLargo(p.fecha ?? f.fecha),
    diaSemana: diaPartes(p.fecha ?? f.fecha)?.semana ?? null,
    diaResto: diaPartes(p.fecha ?? f.fecha)?.resto ?? null,
    libre: p.libre_equipo?.clubes?.nombre ?? null,
    localNombre: p.equipo_local?.clubes?.nombre ?? "?",
    localLogo: CLUB_LOGOS[p.equipo_local?.club_id ?? ""] ?? null,
    visitanteNombre: p.equipo_visitante?.clubes?.nombre ?? "?",
    visitanteLogo: CLUB_LOGOS[p.equipo_visitante?.club_id ?? ""] ?? null,
    estado: p.estado,
    resultadoLocal: p.resultado_local,
    resultadoVisitante: p.resultado_visitante,
    hora: p.hora,
    estadio: p.estadio,
  }));

  const m = medidas(partidos.length || 1);
  // Con un solo partido sobra espacio: fecha y estadio van en tamaño grande.
  const solo = partidos.length <= 1;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: CREMA,
          padding: "56px 48px 44px",
        }}
      >
        {/* Encabezado (igual que la tarjeta en la web) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 24,
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
              {zonaNombre}
            </span>
            <span
              style={{ fontSize: 104, fontWeight: 800, color: CELESTE, lineHeight: 1.02 }}
            >
              Fecha {numeroFecha}
            </span>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={LIGA_LOGO}
            width={168}
            height={185}
            style={{ objectFit: "contain" }}
            alt=""
          />
        </div>

        {/* Tarjeta blanca con los partidos */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            background: "#ffffff",
            borderRadius: 36,
            padding: "16px 48px",
          }}
        >
          {partidos.map((p, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                borderTop: i === 0 ? "0px solid #eee" : "1px solid #eeeeee",
              }}
            >
              {!p.libre && solo && p.diaSemana && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    marginBottom: 56,
                  }}
                >
                  <span
                    style={{
                      fontSize: 66,
                      fontWeight: 800,
                      letterSpacing: 10,
                      color: DORADO,
                      lineHeight: 1.1,
                    }}
                  >
                    {p.diaSemana}
                  </span>
                  <span
                    style={{ fontSize: 96, fontWeight: 800, color: CELESTE, lineHeight: 1.1 }}
                  >
                    {p.diaResto}
                  </span>
                </div>
              )}
              {!p.libre && !solo && p.dia && (
                <span
                  style={{
                    fontSize: 30,
                    fontWeight: 700,
                    letterSpacing: 3,
                    color: DORADO,
                    textTransform: "uppercase",
                    marginBottom: 20,
                  }}
                >
                  {p.dia}
                </span>
              )}
              {p.libre ? (
                <span style={{ fontSize: m.nombre, color: GRIS }}>{p.libre} — libre</span>
              ) : (
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "center",
                    width: 2 * m.col + m.centro,
                  }}
                >
                  <Equipo nombre={p.localNombre} logo={p.localLogo} m={m} />
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      width: m.centro,
                      paddingTop: Math.round(m.escudo * 0.5 - m.marcador * 0.5),
                    }}
                  >
                    <span
                      style={{
                        fontSize: m.marcador,
                        fontWeight: 800,
                        color: p.estado === "jugado" ? CELESTE : DORADO,
                      }}
                    >
                      {p.estado === "jugado"
                        ? `${p.resultadoLocal} - ${p.resultadoVisitante}`
                        : p.hora
                          ? p.hora.slice(0, 5)
                          : "A definir"}
                    </span>
                    <span style={{ fontSize: 17, fontWeight: 700, color: "#9ca3af" }}>
                      {p.estado === "jugado" ? "FINAL" : "PROGRAMADO"}
                    </span>
                  </div>
                  <Equipo nombre={p.visitanteNombre} logo={p.visitanteLogo} m={m} />
                </div>
              )}
              {!p.libre && p.estadio && solo && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    marginTop: 56,
                    width: 880,
                  }}
                >
                  <span style={{ fontSize: 44, fontWeight: 800, color: "#374151" }}>
                    Estadio:
                  </span>
                  <span
                    style={{
                      fontSize: 46,
                      color: "#4b5563",
                      textAlign: "center",
                      lineHeight: 1.2,
                      marginTop: 6,
                    }}
                  >
                    {p.estadio}
                  </span>
                </div>
              )}
              {!p.libre && p.estadio && !solo && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "center",
                    marginTop: 18,
                  }}
                >
                  <span
                    style={{
                      fontSize: 26,
                      fontWeight: 700,
                      color: "#374151",
                      marginRight: 8,
                    }}
                  >
                    Estadio:
                  </span>
                  <span style={{ fontSize: 26, color: "#4b5563" }}>{p.estadio}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Sponsors */}
        <BloqueSponsors />
      </div>
    ),
    {
      width: 1080,
      height: 1920,
      headers: { "Cache-Control": "public, max-age=60, s-maxage=60" },
    }
  );
}

import { ImageResponse } from "next/og";
import { createAdminClient } from "@/lib/supabase/admin";
import { LIGA_LOGO, CLUB_LOGOS } from "@/lib/baked-assets.generated";
import { BloqueSponsors } from "@/lib/og-sponsors";
import { calcularPosiciones } from "@/lib/posiciones";
import { imagenConCache } from "@/lib/og-cache";

// Vercel: margen de tiempo para renderizar la imagen (el default son 10 s).
export const maxDuration = 30;

const CREMA = "#F7F5F0";
const CELESTE = "#0E7FAE";
const DORADO = "#B5842E";
const GRIS = "#737373";

// Anchos de columna (el ancho útil dentro de la tarjeta es ~900 px).
const W_POS = 50;
const W_NOMBRE = 350; // escudo + nombre
const W_STAT = 54;
const W_PTS = 80;

function Celda({
  ancho,
  texto,
  size,
  color,
  bold,
}: {
  ancho: number;
  texto: string | number;
  size: number;
  color: string;
  bold?: boolean;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "center", width: ancho }}>
      <span style={{ fontSize: size, color, fontWeight: bold ? 800 : 500 }}>{texto}</span>
    </div>
  );
}

export async function GET(_req: Request, ctx: { params: Promise<{ zonaId: string }> }) {
  const { zonaId } = await ctx.params;
  const supabase = createAdminClient();

  const { data: zona } = await supabase
    .from("zonas")
    .select("id, nombre, temporada")
    .eq("id", zonaId)
    .single();
  if (!zona) return new Response("Zona no encontrada", { status: 404 });

  const { data: equiposRaw } = await supabase
    .from("equipos")
    .select(
      `id, club_id, ajuste_pj, ajuste_pg, ajuste_pe, ajuste_pp, ajuste_gf, ajuste_gc, ajuste_pts,
       clubes ( nombre )`
    )
    .eq("zona_id", zonaId);

  const equipos = (equiposRaw ?? []).map((e: any) => ({
    id: e.id as string,
    nombre: (e.clubes?.nombre ?? "Equipo") as string,
    logo: CLUB_LOGOS[e.club_id ?? ""] ?? null,
    ajuste: {
      pj: e.ajuste_pj ?? 0,
      pg: e.ajuste_pg ?? 0,
      pe: e.ajuste_pe ?? 0,
      pp: e.ajuste_pp ?? 0,
      gf: e.ajuste_gf ?? 0,
      gc: e.ajuste_gc ?? 0,
      pts: e.ajuste_pts ?? 0,
    },
  }));
  const logoPorEquipo = new Map(equipos.map((e) => [e.id, e.logo]));

  const { data: fechas } = await supabase
    .from("fixture_fechas")
    .select(
      `numero_fecha, partidos ( id, equipo_local_id, equipo_visitante_id, resultado_local, resultado_visitante, estado )`
    )
    .eq("zona_id", zonaId);

  const partidos = (fechas ?? []).flatMap((fecha: any) =>
    (fecha.partidos ?? []).map((p: any) => ({ ...p, numero_fecha: fecha.numero_fecha }))
  );

  const tabla = calcularPosiciones(partidos, equipos);
  const n = tabla.length || 1;

  // Alto de cada fila según la cantidad de equipos (entra todo sin cortarse).
  const rowH = Math.max(64, Math.min(150, Math.floor(1060 / n)));
  const escudo = Math.min(76, rowH - 22);
  const tNombre = rowH >= 100 ? 30 : rowH >= 80 ? 26 : 22;
  const tStat = rowH >= 100 ? 30 : rowH >= 80 ? 27 : 23;

  return imagenConCache({
    carpeta: "posiciones",
    clave: zona.id,
    datos: { nombre: zona.nombre, temporada: zona.temporada, tabla },
    cacheControl: "public, max-age=60, s-maxage=60",
    dibujar: () => new ImageResponse(
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
        {/* Encabezado */}
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
              {zona.nombre}
            </span>
            <span style={{ fontSize: 104, fontWeight: 800, color: CELESTE, lineHeight: 1.02 }}>
              Posiciones
            </span>
            <span style={{ fontSize: 38, color: GRIS, marginTop: 8 }}>
              Temporada {zona.temporada}
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

        {/* Tarjeta blanca con la tabla */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            background: "#ffffff",
            borderRadius: 36,
            padding: "16px 40px",
          }}
        >
          {/* Títulos de columna */}
          <div style={{ display: "flex", alignItems: "center", height: 56 }}>
            <Celda ancho={W_POS} texto="#" size={22} color="#9ca3af" bold />
            <div style={{ display: "flex", width: W_NOMBRE }}>
              <span style={{ fontSize: 22, color: "#9ca3af", fontWeight: 800 }}>EQUIPO</span>
            </div>
            <Celda ancho={W_STAT} texto="PJ" size={22} color="#9ca3af" bold />
            <Celda ancho={W_STAT} texto="PG" size={22} color="#9ca3af" bold />
            <Celda ancho={W_STAT} texto="PE" size={22} color="#9ca3af" bold />
            <Celda ancho={W_STAT} texto="PP" size={22} color="#9ca3af" bold />
            <Celda ancho={W_STAT} texto="GF" size={22} color="#9ca3af" bold />
            <Celda ancho={W_STAT} texto="GC" size={22} color="#9ca3af" bold />
            <Celda ancho={W_STAT} texto="DG" size={22} color="#9ca3af" bold />
            <Celda ancho={W_PTS} texto="PTS" size={22} color={DORADO} bold />
          </div>

          {tabla.map((fila, i) => {
            const logo = logoPorEquipo.get(fila.equipo_id) ?? null;
            const dg = fila.dg > 0 ? `+${fila.dg}` : `${fila.dg}`;
            return (
              <div
                key={fila.equipo_id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  height: rowH,
                  borderTop: "1px solid #eeeeee",
                  background: i === 0 ? "#FBF4E3" : "#ffffff",
                }}
              >
                <Celda
                  ancho={W_POS}
                  texto={i + 1}
                  size={tStat}
                  color={i === 0 ? DORADO : GRIS}
                  bold
                />
                <div style={{ display: "flex", alignItems: "center", width: W_NOMBRE }}>
                  {logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={logo}
                      width={escudo}
                      height={escudo}
                      style={{ objectFit: "contain", marginRight: 14 }}
                      alt=""
                    />
                  ) : (
                    <div
                      style={{
                        width: escudo,
                        height: escudo,
                        borderRadius: escudo,
                        background: "rgba(14,127,174,0.1)",
                        marginRight: 14,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: escudo * 0.45,
                        fontWeight: 700,
                        color: CELESTE,
                      }}
                    >
                      {fila.nombre.charAt(0)}
                    </div>
                  )}
                  <div style={{ display: "flex", width: W_NOMBRE - escudo - 14 }}>
                    <span
                      style={{
                        // nombres largos: letra más chica para que entren en la fila
                        fontSize: fila.nombre.length > 26 ? tNombre - 6 : tNombre,
                        fontWeight: 700,
                        color: CELESTE,
                        lineHeight: 1.1,
                      }}
                    >
                      {fila.nombre}
                    </span>
                  </div>
                </div>
                <Celda ancho={W_STAT} texto={fila.pj} size={tStat} color="#374151" />
                <Celda ancho={W_STAT} texto={fila.pg} size={tStat} color="#374151" />
                <Celda ancho={W_STAT} texto={fila.pe} size={tStat} color="#374151" />
                <Celda ancho={W_STAT} texto={fila.pp} size={tStat} color="#374151" />
                <Celda ancho={W_STAT} texto={fila.gf} size={tStat} color="#374151" />
                <Celda ancho={W_STAT} texto={fila.gc} size={tStat} color="#374151" />
                <Celda ancho={W_STAT} texto={dg} size={tStat} color="#374151" />
                <Celda ancho={W_PTS} texto={fila.pts} size={tStat + 6} color={CELESTE} bold />
              </div>
            );
          })}
        </div>

        {/* Sponsors */}
        <BloqueSponsors />
      </div>
    ),
    { width: 1080, height: 1920 }
  ),
  });
}

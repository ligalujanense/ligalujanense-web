import { ImageResponse } from "next/og";
import { createAdminClient } from "@/lib/supabase/admin";
import { LIGA_LOGO, CLUB_LOGOS } from "@/lib/baked-assets.generated";
import { BloqueSponsors } from "@/lib/og-sponsors";
import { imagenConCache } from "@/lib/og-cache";
import { cargarPartidoFaseFinal } from "@/lib/fase-final-data";
import { infoPartido, type ClubFF } from "@/lib/fase-final";
import { diaPartes } from "@/lib/dias";

export const maxDuration = 30;

const CREMA = "#F7F5F0";
const CELESTE = "#0E7FAE";
const DORADO = "#B5842E";

// Mismas medidas que la imagen de un solo partido de la fase regular.
const M = { escudo: 310, nombre: 50, marcador: 88, col: 340, centro: 280 };

function Equipo({ nombre, club }: { nombre: string; club: ClubFF | null }) {
  const logo = club ? (CLUB_LOGOS[club.id] ?? null) : null;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: M.col }}>
      {logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logo} width={M.escudo} height={M.escudo} style={{ objectFit: "contain" }} alt="" />
      ) : (
        <div
          style={{
            width: M.escudo,
            height: M.escudo,
            borderRadius: M.escudo,
            background: "rgba(14,127,174,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: M.escudo * 0.4,
            fontWeight: 700,
            color: CELESTE,
          }}
        >
          {nombre.charAt(0)}
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "center", width: M.col, marginTop: 14 }}>
        <span
          style={{
            fontSize: M.nombre,
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

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const datos = await cargarPartidoFaseFinal(createAdminClient(), id);
  if (!datos) return new Response("Partido no encontrado", { status: 404 });

  const { cruce, partido } = datos;
  const i = infoPartido(cruce, partido);
  const dia = diaPartes(partido.fecha);

  return imagenConCache({
    carpeta: "fase-final-partidos",
    clave: id,
    datos: {
      ronda: i.ronda,
      tramo: i.tramo,
      temporada: cruce.temporada,
      local: [i.local.nombre, i.local.club?.id],
      visita: [i.visita.nombre, i.visita.club?.id],
      fecha: partido.fecha,
      hora: partido.hora,
      estadio: partido.estadio,
      marcador: i.marcador,
      global: i.global,
    },
    cacheControl: "public, max-age=0, s-maxage=30, must-revalidate",
    dibujar: () =>
      new ImageResponse(
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
                  {i.sinFaseFinal ? (i.tramo ?? "") : i.tramo ? `Fase final · ${i.tramo}` : "Fase final"}
                </span>
                <span style={{ fontSize: 104, fontWeight: 800, color: CELESTE, lineHeight: 1.02 }}>
                  {i.ronda}
                </span>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={LIGA_LOGO} width={168} height={185} style={{ objectFit: "contain" }} alt="" />
            </div>

            {/* Tarjeta blanca */}
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: "#ffffff",
                borderRadius: 36,
                padding: "16px 48px",
              }}
            >
              {dia && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 56 }}>
                  <span style={{ fontSize: 70, fontWeight: 800, letterSpacing: 10, color: DORADO, lineHeight: 1.1 }}>
                    {dia.semana}
                  </span>
                  <span style={{ fontSize: M.nombre, fontWeight: 700, color: CELESTE, lineHeight: 1.1, marginTop: 6 }}>
                    {dia.resto}
                  </span>
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "center",
                  width: 2 * M.col + M.centro,
                }}
              >
                <Equipo nombre={i.local.nombre} club={i.local.club} />
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    width: M.centro,
                    paddingTop: Math.round(M.escudo * 0.5 - M.marcador * 0.5),
                  }}
                >
                  <span style={{ fontSize: M.marcador, fontWeight: 800, color: i.marcador ? CELESTE : DORADO }}>
                    {i.marcador
                      ? `${i.marcador.local} - ${i.marcador.visitante}`
                      : partido.hora
                        ? partido.hora.slice(0, 5)
                        : "A definir"}
                  </span>
                  <span style={{ fontSize: 17, fontWeight: 700, color: "#9ca3af" }}>
                    {i.marcador ? "FINAL" : "PROGRAMADO"}
                  </span>
                  {i.global && (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        marginTop: 40,
                      }}
                    >
                      <span style={{ fontSize: 24, fontWeight: 700, letterSpacing: 4, color: "#9ca3af" }}>
                        GLOBAL
                      </span>
                      <span style={{ fontSize: 64, fontWeight: 800, color: DORADO, lineHeight: 1.1 }}>
                        {i.global.local} - {i.global.visita}
                      </span>
                      {i.global.penales && (
                        <span style={{ fontSize: 26, fontWeight: 700, color: "#6b7280", marginTop: 6 }}>
                          Penales {i.global.penales.local} - {i.global.penales.visita}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <Equipo nombre={i.visita.nombre} club={i.visita.club} />
              </div>

              {partido.estadio && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 56, width: 880 }}>
                  <span style={{ fontSize: 44, fontWeight: 700, color: "#1f2937", WebkitTextStroke: "2px #1f2937" }}>
                    Estadio:
                  </span>
                  <span style={{ fontSize: 46, color: "#4b5563", textAlign: "center", lineHeight: 1.2, marginTop: 6 }}>
                    {partido.estadio}
                  </span>
                </div>
              )}
            </div>

            {/* Sponsors */}
            <BloqueSponsors />
          </div>
        ),
        { width: 1080, height: 1920 }
      ),
  });
}

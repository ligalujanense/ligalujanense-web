import { LIGA_LOGO, CLUB_LOGOS } from "@/lib/baked-assets.generated";
import { BloqueSponsors } from "@/lib/og-sponsors";
import { cantidadTop, formatearNombre } from "@/lib/goleadores";
import type { FilaTabla } from "@/components/site/TablaGoleadores";

const CREMA = "#F7F5F0";
const CELESTE = "#0E7FAE";
const DORADO = "#B5842E";
const GRIS = "#737373";

/** Filas que entran en la imagen: las primeras 10, completando empates, máximo 18. */
export function filasParaImagen(filas: FilaTabla[]): FilaTabla[] {
  return filas.slice(0, cantidadTop(filas, 10, 18));
}

function Escudo({ clubId, nombre, size }: { clubId?: string | null; nombre: string; size: number }) {
  const logo = clubId ? (CLUB_LOGOS[clubId] ?? null) : null;
  return logo ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={logo} width={size} height={size} style={{ objectFit: "contain" }} alt="" />
  ) : (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size,
        background: "rgba(14,127,174,0.1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.45,
        fontWeight: 700,
        color: CELESTE,
      }}
    >
      {nombre.charAt(0)}
    </div>
  );
}

/**
 * Imagen vertical (1080x1920) de una tabla de goleadores, con sponsors abajo.
 * Se usa para cada zona y para el goleador anual.
 */
export function ImagenGoleadores({
  kicker,
  titulo,
  subtitulo,
  filas,
}: {
  kicker: string;
  titulo: string;
  subtitulo?: string;
  filas: FilaTabla[];
}) {
  const n = filas.length || 1;
  // Alto de fila según la cantidad (entra todo sin cortarse).
  const rowH = Math.max(64, Math.min(120, Math.floor(1010 / n)));
  const escudo = Math.min(70, rowH - 18);
  const tNombre = rowH >= 100 ? 34 : rowH >= 80 ? 30 : 26;
  const mostrarClub = rowH >= 96;

  return (
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
            {kicker}
          </span>
          <span style={{ fontSize: 104, fontWeight: 800, color: CELESTE, lineHeight: 1.02 }}>
            {titulo}
          </span>
          {subtitulo && (
            <span style={{ fontSize: 38, color: GRIS, marginTop: 8 }}>{subtitulo}</span>
          )}
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={LIGA_LOGO} width={168} height={185} style={{ objectFit: "contain" }} alt="" />
      </div>

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
        {filas.map((f, i) => (
          <div
            key={`${f.jugador}-${i}`}
            style={{
              display: "flex",
              alignItems: "center",
              height: rowH,
              borderTop: i === 0 ? "0px solid #eee" : "1px solid #eeeeee",
              background: f.lider ? "#FBF4E3" : "#ffffff",
              padding: "0 8px",
            }}
          >
            <div style={{ display: "flex", width: 70, justifyContent: "center" }}>
              <span
                style={{
                  fontSize: tNombre,
                  fontWeight: 800,
                  color: f.lider ? DORADO : GRIS,
                }}
              >
                {f.puesto}
              </span>
            </div>
            <div style={{ display: "flex", width: escudo + 20, justifyContent: "center" }}>
              <Escudo clubId={f.clubId} nombre={f.club} size={escudo} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", flex: 1, marginLeft: 12 }}>
              <span style={{ fontSize: tNombre, fontWeight: 700, color: CELESTE, lineHeight: 1.1 }}>
                {formatearNombre(f.jugador)}
              </span>
              {mostrarClub && (
                <span style={{ fontSize: 24, color: GRIS, marginTop: 4 }}>{f.club}</span>
              )}
            </div>
            <div style={{ display: "flex", width: 110, justifyContent: "center" }}>
              <span style={{ fontSize: tNombre + 14, fontWeight: 800, color: CELESTE }}>{f.goles}</span>
            </div>
          </div>
        ))}
      </div>

      <BloqueSponsors />
    </div>
  );
}

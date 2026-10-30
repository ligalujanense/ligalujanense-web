/** Estado de la transmisión de un partido, según el día y la hora (horario de Argentina). */
export type EstadoTransmision = "envivo" | "proxima" | "repeticion";

/** Día (YYYY-MM-DD) y minutos desde las 00:00, en horario de Argentina. */
export function ahoraArgentina(ahora = new Date()): { dia: string; minutos: number } {
  const dia = ahora.toLocaleDateString("en-CA", { timeZone: "America/Argentina/Buenos_Aires" });
  const hm = ahora.toLocaleTimeString("en-GB", {
    timeZone: "America/Argentina/Buenos_Aires",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const [h, m] = hm.split(":").map(Number);
  return { dia, minutos: h * 60 + m };
}

const ANTES = 15; // se marca "en vivo" 15 minutos antes del horario
const DURACION = 4 * 60; // y hasta 4 horas después, si todavía no se cargó el resultado

/**
 * - "repeticion": el partido ya tiene resultado, o pasó su ventana.
 * - "envivo": es hoy, ya es la hora (o falta poco) y todavía no hay resultado.
 * - "proxima": todavía no es el momento.
 */
export function estadoTransmision(
  partido: { fecha: string | null; hora: string | null },
  tieneResultado: boolean,
  ahora = ahoraArgentina()
): EstadoTransmision {
  if (tieneResultado) return "repeticion";
  if (!partido.fecha) return "proxima";
  if (partido.fecha < ahora.dia) return "repeticion";
  if (partido.fecha > ahora.dia) return "proxima";

  if (!partido.hora) return "envivo";
  const [h, m] = partido.hora.split(":").map(Number);
  const inicio = h * 60 + m;
  if (ahora.minutos < inicio - ANTES) return "proxima";
  return ahora.minutos <= inicio + DURACION ? "envivo" : "repeticion";
}

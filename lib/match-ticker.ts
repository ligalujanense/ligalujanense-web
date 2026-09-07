export type TickerPartido = {
  id: string;
  zona: string;
  local: string;
  visitante: string;
  estado: string;
  resultado_local: number | null;
  resultado_visitante: number | null;
  hora: string | null;
};

type FechaConPartidos = {
  numero_fecha: number;
  partidos: { estado: string }[];
};

/**
 * Regla de negocio de la liga: el fixture se define los miércoles y se juega
 * sábado/domingo. De lunes a miércoles se muestra la última fecha jugada;
 * de jueves a domingo, la próxima fecha programada.
 */
export function calcularModo(ahora: Date = new Date()): "jugada" | "proxima" {
  const local = new Date(
    ahora.toLocaleString("en-US", { timeZone: "America/Argentina/Buenos_Aires" })
  );
  const dia = local.getDay(); // 0 domingo ... 6 sábado
  return dia >= 1 && dia <= 3 ? "jugada" : "proxima";
}

/** Elige, dentro de las fechas de una zona, cuál es la "activa" según el modo. */
export function elegirFechaActiva<T extends FechaConPartidos>(
  fechas: T[],
  modo: "jugada" | "proxima"
): T | null {
  if (fechas.length === 0) return null;

  const conResultado = fechas.filter((f) => f.partidos.some((p) => p.estado === "jugado"));
  const ultimaJugada =
    conResultado.length > 0
      ? conResultado.reduce((a, b) => (a.numero_fecha > b.numero_fecha ? a : b))
      : null;

  if (modo === "jugada") {
    return ultimaJugada ?? fechas.reduce((a, b) => (a.numero_fecha < b.numero_fecha ? a : b));
  }

  // modo "proxima": la fecha siguiente a la última jugada, o la primera si el torneo no arrancó
  if (ultimaJugada) {
    return (
      fechas.find((f) => f.numero_fecha === ultimaJugada.numero_fecha + 1) ?? ultimaJugada
    );
  }
  return fechas.reduce((a, b) => (a.numero_fecha < b.numero_fecha ? a : b));
}

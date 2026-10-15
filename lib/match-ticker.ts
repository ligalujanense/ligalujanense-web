export type TickerPartido = {
  id: string;
  zona: string;
  numeroFecha: number;
  fechaFecha: string | null;
  local: string;
  logoLocal: string | null;
  visitante: string;
  logoVisitante: string | null;
  estado: string;
  resultado_local: number | null;
  resultado_visitante: number | null;
  hora: string | null;
};

type FechaConPartidos = {
  numero_fecha: number;
  partidos: unknown[];
};

type PartidoVisible = { estado: string; fecha?: string | null };
type FechaConFecha = {
  fecha: string | null;
  partidos: PartidoVisible[];
};

/** Fecha de hoy (YYYY-MM-DD) en horario de Argentina, que es el de la liga. */
export function hoyArgentina(): string {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
  });
}

/**
 * La cinta del inicio solo "anuncia": próximos partidos o últimos resultados.
 * Un partido que NO se jugó (sin resultado cargado) y cuya fecha ya pasó deja de
 * mostrarse. Se mantiene si ya tiene resultado, si todavía no llegó su día
 * (el día del partido se sigue viendo hasta que termina) o si la fecha no tiene
 * día definido.
 */
export function soloVigentes<T extends FechaConFecha>(fechas: T[], hoy = hoyArgentina()): T[] {
  return fechas.map((f) => ({
    ...f,
    partidos: f.partidos.filter(
      (p) => {
        // Cada partido tiene su propio día; si no lo tiene, vale el de la jornada.
        const dia = p.fecha ?? f.fecha;
        return p.estado === "jugado" || !dia || dia >= hoy;
      }
    ),
  }));
}

/**
 * Elige, dentro de las fechas de una zona, la fecha "activa": la más
 * reciente que ya tenga partidos cargados (sin importar si están
 * pendientes o jugados). Así el ticker refleja directamente lo que el
 * encargado fue cargando: apenas sube el fixture del fin de semana se ve
 * como próximos partidos, y en cuanto carga los resultados pasa a
 * mostrarlos, sin depender del día de la semana.
 */
export function elegirFechaActiva<T extends FechaConPartidos>(fechas: T[]): T | null {
  const conPartidos = fechas.filter((f) => f.partidos.length > 0);
  if (conPartidos.length === 0) return null;
  return conPartidos.reduce((a, b) => (a.numero_fecha > b.numero_fecha ? a : b));
}

/** Título de la cinta según la mezcla de estados que terminó trayendo cada zona. */
export function tituloTicker(partidos: { estado: string }[]): string {
  if (partidos.length === 0) return "Fixture";
  const todosJugados = partidos.every((p) => p.estado === "jugado");
  if (todosJugados) return "Últimos resultados";
  const todosPendientes = partidos.every((p) => p.estado !== "jugado");
  if (todosPendientes) return "Próximos partidos";
  return "Fixture";
}

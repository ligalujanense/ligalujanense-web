export type PartidoJugado = {
  equipo_local_id: string | null;
  equipo_visitante_id: string | null;
  resultado_local: number | null;
  resultado_visitante: number | null;
  estado: string;
  numero_fecha: number;
};

export type EquipoNombre = {
  id: string;
  nombre: string;
  ajuste?: {
    pj: number;
    pg: number;
    pe: number;
    pp: number;
    gf: number;
    gc: number;
    pts: number;
  };
};

export type FilaPosiciones = {
  equipo_id: string;
  nombre: string;
  pj: number;
  pg: number;
  pe: number;
  pp: number;
  gf: number;
  gc: number;
  dg: number;
  pts: number;
};

export function calcularPosiciones(
  partidos: PartidoJugado[],
  equipos: EquipoNombre[]
): FilaPosiciones[] {
  const tabla = new Map<string, FilaPosiciones>();

  for (const equipo of equipos) {
    const ajuste = equipo.ajuste;
    tabla.set(equipo.id, {
      equipo_id: equipo.id,
      nombre: equipo.nombre,
      pj: ajuste?.pj ?? 0,
      pg: ajuste?.pg ?? 0,
      pe: ajuste?.pe ?? 0,
      pp: ajuste?.pp ?? 0,
      gf: ajuste?.gf ?? 0,
      gc: ajuste?.gc ?? 0,
      dg: 0,
      pts: ajuste?.pts ?? 0,
    });
  }

  for (const partido of partidos) {
    if (
      partido.estado !== "jugado" ||
      !partido.equipo_local_id ||
      !partido.equipo_visitante_id ||
      partido.resultado_local === null ||
      partido.resultado_visitante === null
    ) {
      continue;
    }

    const local = tabla.get(partido.equipo_local_id);
    const visitante = tabla.get(partido.equipo_visitante_id);
    if (!local || !visitante) continue;

    const golesLocal = partido.resultado_local;
    const golesVisitante = partido.resultado_visitante;

    local.pj += 1;
    visitante.pj += 1;
    local.gf += golesLocal;
    local.gc += golesVisitante;
    visitante.gf += golesVisitante;
    visitante.gc += golesLocal;

    if (golesLocal > golesVisitante) {
      local.pg += 1;
      local.pts += 3;
      visitante.pp += 1;
    } else if (golesLocal < golesVisitante) {
      visitante.pg += 1;
      visitante.pts += 3;
      local.pp += 1;
    } else {
      local.pe += 1;
      visitante.pe += 1;
      local.pts += 1;
      visitante.pts += 1;
    }
  }

  return Array.from(tabla.values())
    .map((fila) => ({ ...fila, dg: fila.gf - fila.gc }))
    .sort((a, b) => b.pts - a.pts || b.dg - a.dg || b.gf - a.gf);
}

export type ResultadoReciente = "V" | "E" | "D";

/** Últimos N resultados de un equipo (jugados), en orden cronológico (el más viejo primero). */
export function calcularUltimosResultados(
  partidos: PartidoJugado[],
  equipoId: string,
  cantidad = 5
): ResultadoReciente[] {
  const jugados = partidos
    .filter(
      (p) =>
        p.estado === "jugado" &&
        p.resultado_local !== null &&
        p.resultado_visitante !== null &&
        (p.equipo_local_id === equipoId || p.equipo_visitante_id === equipoId)
    )
    .sort((a, b) => a.numero_fecha - b.numero_fecha)
    .slice(-cantidad);

  return jugados.map((p) => {
    const esLocal = p.equipo_local_id === equipoId;
    const golesPropios = (esLocal ? p.resultado_local : p.resultado_visitante)!;
    const golesRival = (esLocal ? p.resultado_visitante : p.resultado_local)!;
    if (golesPropios > golesRival) return "V";
    if (golesPropios < golesRival) return "D";
    return "E";
  });
}

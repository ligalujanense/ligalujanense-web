export type Ronda = "final_anual" | "fase1" | "fase2" | "semifinal" | "final";

export const RONDA_LABEL: Record<Ronda, string> = {
  final_anual: "Final Anual",
  fase1: "1ª Fase",
  fase2: "2ª Fase",
  semifinal: "Semifinal",
  final: "Final",
};

export type ClubFF = { id: string; nombre: string; logo_url: string | null };

export type PartidoCruce = {
  id: string;
  cruce_id: string;
  tipo: "ida" | "vuelta" | "unico";
  fecha: string | null;
  hora: string | null;
  estadio: string | null;
  goles_a: number | null;
  goles_b: number | null;
  /** Link de YouTube de la transmisión (se muestra como reproductor). */
  transmision_url?: string | null;
};

export type Cruce = {
  id: string;
  categoria: string;
  temporada: string;
  ronda: Ronda;
  codigo: string;
  orden: number;
  formato: "ida_vuelta" | "unico";
  club_a_id: string | null;
  club_b_id: string | null;
  origen_a: string | null;
  origen_b: string | null;
  penales_a: number | null;
  penales_b: number | null;
  partidos: PartidoCruce[];
};

export type CruceResuelto = Cruce & {
  a: ClubFF | null;
  b: ClubFF | null;
  /** Texto a mostrar cuando el lugar todavía no tiene club ("Ganador 4"). */
  etiquetaA: string;
  etiquetaB: string;
  golesA: number | null;
  golesB: number | null;
  /** Cantidad de partidos con resultado cargado / necesarios. */
  jugados: number;
  necesarios: number;
  completo: boolean;
  ganador: ClubFF | null;
  perdedor: ClubFF | null;
  /** Global empatado y todavía sin penales cargados. */
  pendientePenales: boolean;
  porPenales: boolean;
};

function etiquetaOrigen(origen: string | null, porCodigo: Map<string, Cruce>): string {
  if (!origen) return "A definir";
  const [tipo, codigo] = origen.split(":");
  const c = porCodigo.get(codigo);
  const quien = tipo === "P" ? "Perdedor" : "Ganador";
  if (!c) return `${quien} ${codigo}`;
  if (c.ronda === "final_anual") return `${quien} Final Anual`;
  return `${quien} ${codigo.toUpperCase()}`;
}

/**
 * Calcula, para cada cruce, quiénes juegan (directos o venidos de otro cruce),
 * el global y quién avanza. Se resuelve en cadena: el ganador de un cruce
 * completa el lugar del siguiente.
 */
export function resolverCuadro(
  cruces: Cruce[],
  clubes: ClubFF[]
): Map<string, CruceResuelto> {
  const club = new Map(clubes.map((c) => [c.id, c]));
  const porCodigo = new Map(cruces.map((c) => [c.codigo, c]));
  const memo = new Map<string, CruceResuelto>();

  function resolver(codigo: string, pila: string[] = []): CruceResuelto | null {
    const hecho = memo.get(codigo);
    if (hecho) return hecho;
    const c = porCodigo.get(codigo);
    if (!c || pila.includes(codigo)) return null; // evita ciclos por un dato mal cargado

    const lado = (directo: string | null, origen: string | null): ClubFF | null => {
      if (directo) return club.get(directo) ?? null;
      if (!origen) return null;
      const [tipo, cod] = origen.split(":");
      const previo = resolver(cod, [...pila, codigo]);
      return (tipo === "P" ? previo?.perdedor : previo?.ganador) ?? null;
    };

    const a = lado(c.club_a_id, c.origen_a);
    const b = lado(c.club_b_id, c.origen_b);

    const necesarios = c.formato === "unico" ? 1 : 2;
    const cargados = c.partidos.filter((p) => p.goles_a !== null && p.goles_b !== null);
    const golesA = cargados.length ? cargados.reduce((s, p) => s + (p.goles_a ?? 0), 0) : null;
    const golesB = cargados.length ? cargados.reduce((s, p) => s + (p.goles_b ?? 0), 0) : null;
    const completo = cargados.length >= necesarios;

    let ganador: ClubFF | null = null;
    let perdedor: ClubFF | null = null;
    let pendientePenales = false;
    let porPenales = false;

    if (completo && golesA !== null && golesB !== null && a && b) {
      if (golesA !== golesB) {
        ganador = golesA > golesB ? a : b;
        perdedor = golesA > golesB ? b : a;
      } else if (
        c.penales_a !== null &&
        c.penales_b !== null &&
        c.penales_a !== c.penales_b
      ) {
        porPenales = true;
        ganador = c.penales_a > c.penales_b ? a : b;
        perdedor = c.penales_a > c.penales_b ? b : a;
      } else {
        pendientePenales = true;
      }
    }

    const r: CruceResuelto = {
      ...c,
      a,
      b,
      etiquetaA: etiquetaOrigen(c.origen_a, porCodigo),
      etiquetaB: etiquetaOrigen(c.origen_b, porCodigo),
      golesA,
      golesB,
      jugados: cargados.length,
      necesarios,
      completo,
      ganador,
      perdedor,
      pendientePenales,
      porPenales,
    };
    memo.set(codigo, r);
    return r;
  }

  for (const c of cruces) resolver(c.codigo);
  return memo;
}

/** Local de cada partido: en la ida es el club A, en la vuelta el B. */
export function marcadorLocalVisitante(p: PartidoCruce) {
  if (p.goles_a === null || p.goles_b === null) return null;
  return p.tipo === "vuelta"
    ? { local: p.goles_b, visitante: p.goles_a }
    : { local: p.goles_a, visitante: p.goles_b };
}

/** Quién es local y visitante en un partido del cruce, con su marcador y su rótulo. */
export function infoPartido(c: CruceResuelto, p: PartidoCruce) {
  // Local: en la ida y el partido único es el club A; en la vuelta, el B.
  const aLocal = p.tipo !== "vuelta";
  const lado = (club: ClubFF | null, etiqueta: string) => ({ club, nombre: club?.nombre ?? etiqueta });
  const tramo = p.tipo === "ida" ? "Ida" : p.tipo === "vuelta" ? "Vuelta" : null;
  return {
    local: aLocal ? lado(c.a, c.etiquetaA) : lado(c.b, c.etiquetaB),
    visita: aLocal ? lado(c.b, c.etiquetaB) : lado(c.a, c.etiquetaA),
    marcador: marcadorLocalVisitante(p),
    tramo,
    ronda: RONDA_LABEL[c.ronda],
    /** La Final Anual se presenta sola, sin el rótulo "Fase final". */
    sinFaseFinal: c.ronda === "final_anual",
    /**
     * Global del cruce, solo en la vuelta, ordenado como local-visitante de ESTE partido
     * (en la vuelta el local es el club B). Antes de jugarse la vuelta es el resultado de la ida.
     */
    global:
      p.tipo === "vuelta" && c.golesA !== null && c.golesB !== null
        ? {
            local: c.golesB,
            visita: c.golesA,
            penales:
              c.completo &&
              c.golesA === c.golesB &&
              c.penales_a !== null &&
              c.penales_b !== null
                ? { local: c.penales_b, visita: c.penales_a }
                : null,
          }
        : null,
  };
}

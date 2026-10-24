/*
 * Goleadores: lectura del reporte COMET (AFA), emparejamiento de clubes y rankings.
 * Sin dependencias de React ni de Supabase: se usa en el admin, en las páginas y en scripts.
 */

export type FilaGoleador = { jugador: string; club: string; goles: number };

export type ResultadoComet = {
  filas: FilaGoleador[];
  /** Goles en contra: figuran en el reporte pero NO cuentan para el goleador. */
  autogoles: FilaGoleador[];
  /** Líneas que no se pudieron interpretar (para avisar). */
  ignoradas: string[];
};

/** Minúsculas, sin tildes ni signos, espacios simples. "PEÑA" y "Pena" quedan iguales. */
export function normalizar(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const ENCABEZADOS = /comet|goleadores|organizaci[oó]n|competici[oó]n|n[uú]mero total|p[aá]gina|impreso por/i;

/**
 * Lee el texto de un reporte "Goleadores" de COMET (copiado del PDF).
 * Formato: una línea con la cantidad de goles ("7") y debajo los jugadores que hicieron
 * esa cantidad, cada uno como "APELLIDO, NOMBRE (CLUB)". Una línea "Autogol" marca los
 * jugadores siguientes como goles en contra.
 * También acepta líneas sueltas "Jugador; Club; Goles" (o separadas por tabulación).
 */
export function parsearComet(texto: string): ResultadoComet {
  const filas: FilaGoleador[] = [];
  const autogoles: FilaGoleador[] = [];
  const ignoradas: string[] = [];
  let goles: number | null = null;
  let enAutogol = false;

  for (const crudo of texto.split(/\r?\n/)) {
    const linea = crudo.replace(/\s+/g, " ").trim();
    if (!linea) continue;
    if (ENCABEZADOS.test(linea)) continue;

    if (/^\d+$/.test(linea)) {
      goles = Number(linea);
      enAutogol = false;
      continue;
    }
    if (/^autogol(es)?$/i.test(linea)) {
      enAutogol = true;
      continue;
    }

    const suelta = /^(.+?)\s*[;\t]\s*(.+?)\s*[;\t]\s*(\d+)$/.exec(crudo.trim());
    if (suelta) {
      filas.push({ jugador: suelta[1].trim(), club: suelta[2].trim(), goles: Number(suelta[3]) });
      continue;
    }

    const m = /^(.+?)\s*\(([^()]+)\)$/.exec(linea);
    if (m && goles !== null) {
      const fila = { jugador: m[1].trim(), club: m[2].trim(), goles };
      (enAutogol ? autogoles : filas).push(fila);
      continue;
    }
    ignoradas.push(linea);
  }
  return { filas, autogoles, ignoradas };
}

const ABREVIATURAS: [RegExp, string][] = [
  [/\bdep\b/g, "deportivo"],
  [/\bgral\b/g, "general"],
  [/\basoc\b/g, "asociacion"],
  [/\bcd\b/g, "cd"],
];

function expandir(s: string): string {
  let n = normalizar(s);
  for (const [re, por] of ABREVIATURAS) n = n.replace(re, por);
  return n;
}

/** Busca a qué club de la base corresponde el nombre del reporte ("DEP BONGIOVANNI" → "Deportivo Bongiovanni"). */
export function emparejarClub<T extends { id: string; nombre: string }>(
  nombreReporte: string,
  clubes: T[]
): T | null {
  const buscado = expandir(nombreReporte);
  if (!buscado) return null;
  const candidatos = clubes.map((c) => ({ c, n: expandir(c.nombre) }));
  const exacto = candidatos.find((x) => x.n === buscado);
  if (exacto) return exacto.c;
  // "ASOC CRISTIANA" es el comienzo de "Asociación Cristiana de Fútbol Argentino"
  const prefijo = candidatos.filter((x) => x.n.startsWith(buscado + " ") || buscado.startsWith(x.n + " "));
  return prefijo.length === 1 ? prefijo[0].c : null;
}

const MINUSCULAS = new Set(["de", "del", "la", "las", "los", "da", "do", "di", "y"]);

/** "ACOSTA ABBRUZZESE, MATIAS" → "Acosta Abbruzzese, Matias" (el reporte no trae tildes). */
export function formatearNombre(nombre: string): string {
  return nombre
    .toLowerCase()
    .split(" ")
    .map((p, i) => (i > 0 && MINUSCULAS.has(p) ? p : p.charAt(0).toUpperCase() + p.slice(1)))
    .join(" ")
    .replace(/(^|[-'])([a-zñ])/g, (_, a: string, b: string) => a + b.toUpperCase());
}

export type FilaRanking = {
  puesto: number;
  lider?: boolean;
  jugador: string;
  club: string;
  clubId: string | null;
  goles: number;
  /** Desglose para el goleador anual. */
  regular?: number;
  faseFinal?: number;
};

/**
 * Ordena por goles; los que empatan en goles van por orden alfabético del club (y después
 * del jugador). La numeración es corrida: 1, 2, 3, 4… (sin repetir ni saltear números).
 * `lider` marca a todos los que tienen la mayor cantidad de goles.
 */
export function rankear<T extends { jugador: string; goles: number }>(
  filas: T[],
  clubDe: (f: T) => string = () => ""
): (T & { puesto: number; lider: boolean })[] {
  const ordenadas = [...filas].sort(
    (a, b) =>
      b.goles - a.goles ||
      normalizar(clubDe(a)).localeCompare(normalizar(clubDe(b))) ||
      normalizar(a.jugador).localeCompare(normalizar(b.jugador))
  );
  const maximo = ordenadas[0]?.goles ?? 0;
  return ordenadas.map((f, i) => ({ ...f, puesto: i + 1, lider: f.goles === maximo && maximo > 0 }));
}

type FilaDb = {
  jugador: string;
  club_id: string | null;
  club_nombre: string;
  goles: number;
  zona_id: string | null;
};

/**
 * Suma los goles de todas las zonas y de la fase final por jugador.
 * Mismo jugador = mismo nombre normalizado + mismo club.
 */
export function goleadorAnual(
  filas: FilaDb[],
  nombreClub: (f: FilaDb) => string
): FilaRanking[] {
  const mapa = new Map<string, FilaRanking>();
  for (const f of filas) {
    const clave = `${normalizar(f.jugador)}|${f.club_id ?? normalizar(f.club_nombre)}`;
    const faseFinal = f.zona_id === null;
    const actual = mapa.get(clave);
    if (actual) {
      actual.goles += f.goles;
      if (faseFinal) actual.faseFinal = (actual.faseFinal ?? 0) + f.goles;
      else actual.regular = (actual.regular ?? 0) + f.goles;
    } else {
      mapa.set(clave, {
        puesto: 0,
        jugador: f.jugador,
        club: nombreClub(f),
        clubId: f.club_id,
        goles: f.goles,
        regular: faseFinal ? 0 : f.goles,
        faseFinal: faseFinal ? f.goles : 0,
      });
    }
  }
  return rankear([...mapa.values()], (f) => f.club);
}

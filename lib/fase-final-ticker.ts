import { infoPartido, type CruceResuelto, type PartidoCruce } from "./fase-final";
import type { TickerPartido } from "./match-ticker";
import { parsearYoutube } from "./youtube";
import { estadoTransmision } from "./transmision";

type Item = { dia: string; p: PartidoCruce; c: CruceResuelto };

function dias(iso: string): number {
  return Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10)) / 86_400_000;
}

const cargado = (p: PartidoCruce) => p.goles_a !== null && p.goles_b !== null;

/**
 * Partidos de la fase final para la cinta del inicio, con el mismo criterio que
 * la fase regular: anuncia los próximos partidos y los últimos resultados.
 *
 * Los partidos se agrupan por jornada (días seguidos, ej. sábado y domingo). Se
 * muestra la primera jornada que todavía tiene partidos por jugarse; si la
 * anterior terminó hace poco (hasta 3 días), sus resultados siguen a la vista.
 * Lo que ya pasó sin resultado cargado no se muestra.
 */
export function tickerFaseFinal(cruces: CruceResuelto[], hoy: string): TickerPartido[] {
  const items: Item[] = cruces
    .flatMap((c) => c.partidos.filter((p) => p.fecha).map((p) => ({ dia: p.fecha as string, p, c })))
    .sort((x, y) => x.dia.localeCompare(y.dia) || (x.p.hora ?? "").localeCompare(y.p.hora ?? ""));
  if (items.length === 0) return [];

  const grupos: Item[][] = [];
  for (const it of items) {
    const ultimo = grupos[grupos.length - 1];
    if (ultimo && dias(it.dia) - dias(ultimo[ultimo.length - 1].dia) <= 4) ultimo.push(it);
    else grupos.push([it]);
  }

  let activo = grupos.findIndex((g) => g.some((i) => !cargado(i.p) && i.dia >= hoy));
  if (activo < 0) activo = grupos.length - 1; // todo jugado: queda el último con resultados

  const seleccion = [grupos[activo]];
  const previo = grupos[activo - 1];
  if (previo && previo.every((i) => cargado(i.p)) && dias(hoy) - dias(previo[previo.length - 1].dia) <= 3) {
    seleccion.unshift(previo);
  }

  return seleccion
    .flat()
    .filter((i) => cargado(i.p) || i.dia >= hoy)
    .map(({ p, c }) => {
      const i = infoPartido(c, p);
      return {
        id: `ff-${p.id}`,
        enVivo:
          !!parsearYoutube(p.transmision_url) &&
          estadoTransmision(p, !!i.marcador) === "envivo",
        zona: "",
        numeroFecha: 0,
        etiqueta: i.tramo ? `${i.ronda} · ${i.tramo}` : i.ronda,
        href: `/fase-final/partido/${p.id}`,
        fechaFecha: p.fecha,
        local: i.local.nombre,
        logoLocal: i.local.club?.logo_url ?? null,
        visitante: i.visita.nombre,
        logoVisitante: i.visita.club?.logo_url ?? null,
        estado: i.marcador ? "jugado" : "pendiente",
        resultado_local: i.marcador?.local ?? null,
        resultado_visitante: i.marcador?.visitante ?? null,
        hora: p.hora,
      } satisfies TickerPartido;
    });
}

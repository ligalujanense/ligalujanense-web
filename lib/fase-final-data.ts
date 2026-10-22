import type { SupabaseClient } from "@supabase/supabase-js";
import { resolverCuadro, type ClubFF, type Cruce, type CruceResuelto } from "./fase-final";

/** Carga el cuadro completo de una categoría + temporada y lo resuelve. */
export async function cargarCuadro(
  supabase: SupabaseClient,
  categoria: string,
  temporada: string
): Promise<{ cruces: CruceResuelto[]; clubes: ClubFF[] }> {
  const { data: crucesRaw } = await supabase
    .from("fase_final_cruces")
    .select("*, partidos:fase_final_partidos ( * )")
    .eq("categoria", categoria)
    .eq("temporada", temporada)
    .order("orden");

  const { data: clubes } = await supabase
    .from("clubes")
    .select("id, nombre, logo_url")
    .order("nombre");

  const cruces = ((crucesRaw ?? []) as Cruce[]).map((c) => ({
    ...c,
    partidos: [...(c.partidos ?? [])].sort((x, y) => x.tipo.localeCompare(y.tipo)),
  }));

  const resueltos = resolverCuadro(cruces, (clubes ?? []) as ClubFF[]);
  return {
    cruces: cruces.map((c) => resueltos.get(c.codigo)!).filter(Boolean),
    clubes: (clubes ?? []) as ClubFF[],
  };
}

/** Un partido de la fase final con su cruce ya resuelto (para su página e imagen). */
export async function cargarPartidoFaseFinal(supabase: SupabaseClient, id: string) {
  const { data: p } = await supabase
    .from("fase_final_partidos")
    .select("id, cruce:fase_final_cruces ( categoria, temporada, codigo )")
    .eq("id", id)
    .single();
  const cruceRef = (p as any)?.cruce;
  if (!cruceRef) return null;

  const { cruces } = await cargarCuadro(supabase, cruceRef.categoria, cruceRef.temporada);
  const cruce = cruces.find((c) => c.codigo === cruceRef.codigo);
  const partido = cruce?.partidos.find((x) => x.id === id);
  return cruce && partido ? { cruce, partido } : null;
}

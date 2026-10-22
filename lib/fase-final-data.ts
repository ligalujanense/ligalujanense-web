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

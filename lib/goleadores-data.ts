import type { SupabaseClient } from "@supabase/supabase-js";
import { formatearNombre, goleadorAnual, rankear } from "./goleadores";
import type { FilaTabla } from "@/components/site/TablaGoleadores";

type FilaDb = {
  jugador: string;
  club_id: string | null;
  club_nombre: string;
  goles: number;
  zona_id: string | null;
};

async function clubesPorId(supabase: SupabaseClient) {
  const { data } = await supabase.from("clubes").select("id, nombre, logo_url");
  return new Map((data ?? []).map((c) => [c.id as string, c as { id: string; nombre: string; logo_url: string | null }]));
}

/** Goleadores de una zona, ya ordenados y con puestos. */
export async function goleadoresDeZona(supabase: SupabaseClient, zonaId: string): Promise<FilaTabla[]> {
  const { data } = await supabase
    .from("goleadores")
    .select("jugador, club_id, club_nombre, goles, zona_id")
    .eq("zona_id", zonaId);
  const clubes = await clubesPorId(supabase);
  const nombreClub = (f: FilaDb) =>
    (f.club_id ? clubes.get(f.club_id)?.nombre : undefined) ?? formatearNombre(f.club_nombre);
  return rankear((data ?? []) as FilaDb[], nombreClub).map((f) => {
    const club = f.club_id ? clubes.get(f.club_id) : undefined;
    return {
      puesto: f.puesto,
      lider: f.lider,
      jugador: f.jugador,
      club: club?.nombre ?? formatearNombre(f.club_nombre),
      logo: club?.logo_url ?? null,
      clubId: f.club_id,
      goles: f.goles,
    };
  });
}

/** Goleador anual: suma las zonas y la fase final de la temporada. */
export async function goleadorAnualDeTemporada(
  supabase: SupabaseClient,
  categoria: string,
  temporada: string
): Promise<{ filas: FilaTabla[]; hayFaseFinal: boolean }> {
  const { data } = await supabase
    .from("goleadores")
    .select("jugador, club_id, club_nombre, goles, zona_id")
    .eq("categoria", categoria)
    .eq("temporada", temporada);
  const rows = (data ?? []) as FilaDb[];
  const clubes = await clubesPorId(supabase);

  const ranking = goleadorAnual(rows, (f) =>
    f.club_id && clubes.get(f.club_id) ? clubes.get(f.club_id)!.nombre : formatearNombre(f.club_nombre)
  );
  return {
    hayFaseFinal: rows.some((r) => r.zona_id === null && r.goles > 0),
    filas: ranking.map((f) => ({
      puesto: f.puesto,
      lider: f.lider,
      jugador: f.jugador,
      club: f.club,
      logo: f.clubId ? (clubes.get(f.clubId)?.logo_url ?? null) : null,
      clubId: f.clubId,
      goles: f.goles,
      regular: f.regular,
      faseFinal: f.faseFinal,
    })),
  };
}

"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isAdmin } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { cargarPartidoFaseFinal } from "@/lib/fase-final-data";
import { normalizar } from "@/lib/goleadores";

function refrescar() {
  revalidatePath("/admin/fase-final");
  revalidatePath("/admin/goleadores");
  revalidatePath("/torneos", "layout");
}

/**
 * Recalcula el total de goles de un jugador en la fase final (tabla goleadores, zona_id NULL)
 * sumando lo que tiene asignado en todos los partidos. Si llega a 0, se borra la fila.
 */
async function sincronizarTotales(
  sb: SupabaseClient,
  categoria: string,
  temporada: string,
  jugador: string,
  clubId: string,
  clubNombre: string
) {
  const { data: cruces } = await sb
    .from("fase_final_cruces")
    .select("id")
    .eq("categoria", categoria)
    .eq("temporada", temporada);
  const { data: partidos } = await sb
    .from("fase_final_partidos")
    .select("id")
    .in("cruce_id", (cruces ?? []).map((c) => c.id));
  const { data: asignados } = await sb
    .from("fase_final_goles_jugador")
    .select("jugador, club_id, goles")
    .in("partido_id", (partidos ?? []).map((p) => p.id));

  const total = (asignados ?? [])
    .filter((f) => f.club_id === clubId && normalizar(f.jugador) === normalizar(jugador))
    .reduce((s, f) => s + f.goles, 0);

  const { data: totales } = await sb
    .from("goleadores")
    .select("id, jugador, club_id, club_nombre")
    .eq("categoria", categoria)
    .eq("temporada", temporada)
    .is("zona_id", null);
  const fila = (totales ?? []).find(
    (f) =>
      normalizar(f.jugador) === normalizar(jugador) &&
      (f.club_id === clubId || normalizar(f.club_nombre) === normalizar(clubNombre))
  );

  if (total <= 0) {
    if (fila) await sb.from("goleadores").delete().eq("id", fila.id);
  } else if (fila) {
    await sb
      .from("goleadores")
      .update({ goles: total, club_id: clubId, updated_at: new Date().toISOString() })
      .eq("id", fila.id);
  } else {
    await sb.from("goleadores").insert({
      categoria,
      temporada,
      zona_id: null,
      club_id: clubId,
      club_nombre: clubNombre,
      jugador,
      goles: total,
    });
  }
}

/** Asigna goles a un jugador en un partido (si ya tenía, se suman). */
export async function asignarGolesJugador(
  partidoId: string,
  jugadorIn: string,
  clubId: string,
  goles: number
) {
  if (!(await isAdmin())) return { error: "No autorizado" };
  const g = Number(goles);
  if (!Number.isInteger(g) || g < 1 || g > 20) return { error: "Los goles tienen que ser entre 1 y 20" };
  const jugador = jugadorIn.replace(/\s+/g, " ").trim().toUpperCase();
  if (!jugador) return { error: "Falta el jugador" };

  const sb = createAdminClient();
  const datos = await cargarPartidoFaseFinal(sb, partidoId);
  if (!datos) return { error: "Partido no encontrado" };
  const club = [datos.cruce.a, datos.cruce.b].find((c) => c?.id === clubId);
  if (!club) return { error: "Ese jugador no es de ninguno de los dos clubes de este partido" };

  const { data: existentes } = await sb
    .from("fase_final_goles_jugador")
    .select("id, jugador, club_id, goles")
    .eq("partido_id", partidoId);
  const igual = (existentes ?? []).find(
    (e) => e.club_id === clubId && normalizar(e.jugador) === normalizar(jugador)
  );

  const { error } = igual
    ? await sb.from("fase_final_goles_jugador").update({ goles: igual.goles + g }).eq("id", igual.id)
    : await sb.from("fase_final_goles_jugador").insert({
        partido_id: partidoId,
        jugador,
        club_id: clubId,
        club_nombre: club.nombre,
        goles: g,
      });
  if (error) return { error: error.message };

  await sincronizarTotales(sb, datos.cruce.categoria, datos.cruce.temporada, jugador, clubId, club.nombre);
  refrescar();
  return { ok: "Goles asignados" };
}

/** Cambia los goles de una asignación (0 = quitarla). */
export async function cambiarGolesAsignados(id: string, goles: number) {
  if (!(await isAdmin())) return { error: "No autorizado" };
  const g = Number(goles);
  if (!Number.isInteger(g) || g < 0 || g > 20) return { error: "Goles inválidos" };

  const sb = createAdminClient();
  const { data: fila } = await sb
    .from("fase_final_goles_jugador")
    .select("id, partido_id, jugador, club_id, club_nombre")
    .eq("id", id)
    .single();
  if (!fila) return { error: "Asignación no encontrada" };
  const datos = await cargarPartidoFaseFinal(sb, fila.partido_id);
  if (!datos) return { error: "Partido no encontrado" };

  const { error } =
    g === 0
      ? await sb.from("fase_final_goles_jugador").delete().eq("id", id)
      : await sb.from("fase_final_goles_jugador").update({ goles: g }).eq("id", id);
  if (error) return { error: error.message };

  await sincronizarTotales(
    sb,
    datos.cruce.categoria,
    datos.cruce.temporada,
    fila.jugador,
    fila.club_id,
    fila.club_nombre
  );
  refrescar();
}

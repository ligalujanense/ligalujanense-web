"use server";

import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { emparejarClub, normalizar, parsearComet } from "@/lib/goleadores";

const CATEGORIA = "futbol-masculino";

type Ambito = { zonaId: string | null; categoria: string; temporada: string };

/** "fase-final" = sin zona. Para una zona, categoría y temporada salen de la zona. */
async function resolverAmbito(ambito: string, temporadaFaseFinal: string): Promise<Ambito | null> {
  if (ambito === "fase-final") {
    return /^\d{4}$/.test(temporadaFaseFinal)
      ? { zonaId: null, categoria: CATEGORIA, temporada: temporadaFaseFinal }
      : null;
  }
  const { data } = await createAdminClient()
    .from("zonas")
    .select("id, categoria, temporada")
    .eq("id", ambito)
    .single();
  return data ? { zonaId: data.id, categoria: data.categoria, temporada: data.temporada } : null;
}

function refrescar() {
  revalidatePath("/admin/goleadores");
  revalidatePath("/posiciones", "layout");
  revalidatePath("/torneos", "layout");
}

function entero(v: unknown): number | null {
  const n = Number(v);
  return Number.isInteger(n) && n >= 0 && n < 1000 ? n : null;
}

/** Lee el texto pegado y dice qué se cargaría, sin guardar nada. */
export async function revisarComet(texto: string) {
  if (!(await isAdmin())) return { error: "No autorizado" };
  const r = parsearComet(texto);
  const { data: clubes } = await createAdminClient().from("clubes").select("id, nombre");
  const sinClub = [
    ...new Set(r.filas.filter((f) => !emparejarClub(f.club, clubes ?? [])).map((f) => f.club)),
  ];
  return {
    jugadores: r.filas.length,
    goles: r.filas.reduce((s, f) => s + f.goles, 0),
    autogoles: r.autogoles.map((a) => `${a.jugador} (${a.club})`),
    sinClub,
    ignoradas: r.ignoradas.slice(0, 5),
  };
}

/** Reemplaza TODA la lista del ámbito por la del reporte (los totales de COMET son acumulados). */
export async function importarComet(ambito: string, temporadaFaseFinal: string, texto: string) {
  if (!(await isAdmin())) return { error: "No autorizado" };
  const a = await resolverAmbito(ambito, temporadaFaseFinal);
  if (!a) return { error: "Zona o temporada inválida" };

  const r = parsearComet(texto);
  if (r.filas.length === 0) return { error: "No encontré jugadores en el texto pegado" };

  const supabase = createAdminClient();
  const { data: clubes } = await supabase.from("clubes").select("id, nombre");

  // Si el reporte repite jugador+club, se suman (no debería pasar, pero no se pierde nada).
  const mapa = new Map<string, { jugador: string; club_nombre: string; club_id: string | null; goles: number }>();
  for (const f of r.filas) {
    const club = emparejarClub(f.club, clubes ?? []);
    const clave = `${normalizar(f.jugador)}|${normalizar(f.club)}`;
    const e = mapa.get(clave);
    if (e) e.goles += f.goles;
    else mapa.set(clave, { jugador: f.jugador, club_nombre: f.club, club_id: club?.id ?? null, goles: f.goles });
  }

  let borrar = supabase.from("goleadores").delete().eq("categoria", a.categoria).eq("temporada", a.temporada);
  borrar = a.zonaId ? borrar.eq("zona_id", a.zonaId) : borrar.is("zona_id", null);
  const { error: eDel } = await borrar;
  if (eDel) return { error: eDel.message };

  const filas = [...mapa.values()].map((f) => ({
    ...f,
    categoria: a.categoria,
    temporada: a.temporada,
    zona_id: a.zonaId,
  }));
  const { error } = await supabase.from("goleadores").insert(filas);
  if (error) return { error: error.message };

  refrescar();
  return { ok: `${filas.length} jugadores cargados` };
}

export async function guardarGoleador(ambito: string, temporadaFaseFinal: string, formData: FormData) {
  if (!(await isAdmin())) return { error: "No autorizado" };
  const a = await resolverAmbito(ambito, temporadaFaseFinal);
  if (!a) return { error: "Zona o temporada inválida" };

  const jugador = String(formData.get("jugador") ?? "").replace(/\s+/g, " ").trim().toUpperCase();
  const goles = entero(formData.get("goles"));
  const clubId = String(formData.get("club_id") ?? "");
  const clubOtro = String(formData.get("club_otro") ?? "").trim().toUpperCase();
  if (!jugador) return { error: "Falta el jugador" };
  if (goles === null) return { error: "Goles inválidos" };

  const supabase = createAdminClient();
  let clubNombre = clubOtro;
  let club_id: string | null = null;
  if (clubId) {
    const { data: club } = await supabase.from("clubes").select("id, nombre").eq("id", clubId).single();
    if (!club) return { error: "Club no encontrado" };
    club_id = club.id;
    clubNombre = club.nombre;
  }
  if (!clubNombre) return { error: "Elegí el club (o escribí el nombre)" };

  // ¿Ya está cargado ese jugador en este ámbito y club? Entonces se actualiza.
  let q = supabase
    .from("goleadores")
    .select("id, jugador, club_nombre")
    .eq("categoria", a.categoria)
    .eq("temporada", a.temporada);
  q = a.zonaId ? q.eq("zona_id", a.zonaId) : q.is("zona_id", null);
  const { data: existentes } = await q;
  const igual = (existentes ?? []).find(
    (e) => normalizar(e.jugador) === normalizar(jugador) && normalizar(e.club_nombre) === normalizar(clubNombre)
  );

  const { error } = igual
    ? await supabase
        .from("goleadores")
        .update({ goles, club_id, updated_at: new Date().toISOString() })
        .eq("id", igual.id)
    : await supabase.from("goleadores").insert({
        categoria: a.categoria,
        temporada: a.temporada,
        zona_id: a.zonaId,
        club_id,
        club_nombre: clubNombre,
        jugador,
        goles,
      });
  if (error) return { error: error.message };

  refrescar();
  return { ok: igual ? "Actualizado (ya estaba cargado)" : "Agregado" };
}

export async function actualizarGoles(id: string, goles: number) {
  if (!(await isAdmin())) return { error: "No autorizado" };
  const g = entero(goles);
  if (g === null) return { error: "Goles inválidos" };
  const { error } = await createAdminClient()
    .from("goleadores")
    .update({ goles: g, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { error: error.message };
  refrescar();
}

export async function eliminarGoleador(id: string) {
  if (!(await isAdmin())) return { error: "No autorizado" };
  const { error } = await createAdminClient().from("goleadores").delete().eq("id", id);
  if (error) return { error: error.message };
  refrescar();
}

"use server";

import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { parsearYoutube } from "@/lib/youtube";

function entero(v: FormDataEntryValue | null): number | null {
  const s = String(v ?? "").trim();
  if (s === "") return null;
  const n = Number(s);
  return Number.isInteger(n) && n >= 0 && n < 100 ? n : null;
}

function refrescar() {
  revalidatePath("/admin/fase-final");
  revalidatePath("/torneos", "layout");
}

export async function guardarPartidoCruce(
  cruceId: string,
  tipo: "ida" | "vuelta" | "unico",
  formData: FormData
) {
  if (!(await isAdmin())) return { error: "No autorizado" };
  if (!["ida", "vuelta", "unico"].includes(tipo)) return { error: "Tipo inválido" };

  const goles_a = entero(formData.get("goles_a"));
  const goles_b = entero(formData.get("goles_b"));
  // Los goles se cargan los dos o ninguno.
  if ((goles_a === null) !== (goles_b === null)) {
    return { error: "Cargá los goles de los dos equipos (o dejá ambos vacíos)" };
  }

  const fecha = String(formData.get("fecha") ?? "") || null;
  const hora = String(formData.get("hora") ?? "") || null;
  const estadio = String(formData.get("estadio") ?? "").trim() || null;
  const transmision_url = String(formData.get("transmision_url") ?? "").trim() || null;
  if (transmision_url && !parsearYoutube(transmision_url)) {
    return {
      error:
        "El link de la transmisión tiene que ser de YouTube (por ejemplo https://www.youtube.com/watch?v=… o https://youtu.be/…)",
    };
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("fase_final_partidos")
    .upsert(
      { cruce_id: cruceId, tipo, fecha, hora, estadio, goles_a, goles_b, transmision_url },
      { onConflict: "cruce_id,tipo" }
    );
  if (error) return { error: error.message };

  refrescar();
}

export async function guardarPenalesCruce(cruceId: string, formData: FormData) {
  if (!(await isAdmin())) return { error: "No autorizado" };

  const penales_a = entero(formData.get("penales_a"));
  const penales_b = entero(formData.get("penales_b"));
  if ((penales_a === null) !== (penales_b === null)) {
    return { error: "Cargá los penales de los dos equipos (o dejá ambos vacíos)" };
  }
  if (penales_a !== null && penales_a === penales_b) {
    return { error: "Los penales no pueden terminar empatados" };
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("fase_final_cruces")
    .update({ penales_a, penales_b })
    .eq("id", cruceId);
  if (error) return { error: error.message };

  refrescar();
}

/** Cambia los clubes de un cruce, solo en los lados que no vienen de otro cruce. */
export async function guardarClubesCruce(cruceId: string, formData: FormData) {
  if (!(await isAdmin())) return { error: "No autorizado" };

  const supabase = createAdminClient();
  const { data: cruce } = await supabase
    .from("fase_final_cruces")
    .select("origen_a, origen_b")
    .eq("id", cruceId)
    .single();
  if (!cruce) return { error: "Cruce no encontrado" };

  const cambios: Record<string, string | null> = {};
  if (!cruce.origen_a) cambios.club_a_id = String(formData.get("club_a_id") ?? "") || null;
  if (!cruce.origen_b) cambios.club_b_id = String(formData.get("club_b_id") ?? "") || null;
  if (Object.keys(cambios).length === 0) return { error: "Este cruce se completa solo" };

  const { error } = await supabase.from("fase_final_cruces").update(cambios).eq("id", cruceId);
  if (error) return { error: error.message };

  refrescar();
}

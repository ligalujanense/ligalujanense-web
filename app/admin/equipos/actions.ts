"use server";

import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function crearEquipo(formData: FormData) {
  if (!(await isAdmin())) return { error: "No autorizado" };

  const club_id = String(formData.get("club_id") ?? "");
  const zona_id = String(formData.get("zona_id") ?? "");
  if (!club_id || !zona_id) return { error: "Faltan datos" };

  const supabase = createAdminClient();
  const { error } = await supabase.from("equipos").insert({ club_id, zona_id });
  if (error) return { error: error.message };

  revalidatePath("/admin/equipos");
  revalidatePath("/posiciones");
  revalidatePath("/fixture");
}

export async function eliminarEquipo(id: string) {
  if (!(await isAdmin())) return { error: "No autorizado" };

  const supabase = createAdminClient();
  const { error } = await supabase.from("equipos").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/equipos");
  revalidatePath("/posiciones");
  revalidatePath("/fixture");
}

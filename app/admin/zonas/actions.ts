"use server";

import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function crearZona(formData: FormData) {
  if (!(await isAdmin())) return { error: "No autorizado" };

  const nombre = String(formData.get("nombre") ?? "").trim();
  const temporada = String(formData.get("temporada") ?? "").trim();
  if (!nombre || !temporada) return { error: "Faltan datos" };

  const supabase = createAdminClient();
  const { error } = await supabase.from("zonas").insert({ nombre, temporada });
  if (error) return { error: error.message };

  revalidatePath("/admin/zonas");
  revalidatePath("/");
}

export async function eliminarZona(id: string) {
  if (!(await isAdmin())) return { error: "No autorizado" };

  const supabase = createAdminClient();
  const { error } = await supabase.from("zonas").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/zonas");
  revalidatePath("/");
}

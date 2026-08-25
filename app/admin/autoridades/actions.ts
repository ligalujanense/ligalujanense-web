"use server";

import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function crearAutoridad(formData: FormData) {
  if (!(await isAdmin())) return { error: "No autorizado" };

  const nombre = String(formData.get("nombre") ?? "").trim();
  const cargo = String(formData.get("cargo") ?? "").trim();
  if (!nombre || !cargo) return { error: "Faltan datos" };

  const supabase = createAdminClient();
  const { error } = await supabase.from("autoridades").insert({ nombre, cargo });
  if (error) return { error: error.message };

  revalidatePath("/admin/autoridades");
  revalidatePath("/institucional");
}

export async function eliminarAutoridad(id: string) {
  if (!(await isAdmin())) return { error: "No autorizado" };

  const supabase = createAdminClient();
  const { error } = await supabase.from("autoridades").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/autoridades");
  revalidatePath("/institucional");
}

"use server";

import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function crearSponsor(formData: FormData) {
  if (!(await isAdmin())) return { error: "No autorizado" };

  const nombre = String(formData.get("nombre") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();
  const logo_url = String(formData.get("logo_url") ?? "").trim();
  if (!nombre) return { error: "Falta el nombre" };

  const supabase = createAdminClient();
  const { error } = await supabase.from("sponsors").insert({
    nombre,
    url: url || null,
    logo_url: logo_url || null,
  });
  if (error) return { error: error.message };

  revalidatePath("/admin/sponsors");
  revalidatePath("/");
}

export async function eliminarSponsor(id: string) {
  if (!(await isAdmin())) return { error: "No autorizado" };

  const supabase = createAdminClient();
  const { error } = await supabase.from("sponsors").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/sponsors");
  revalidatePath("/");
}

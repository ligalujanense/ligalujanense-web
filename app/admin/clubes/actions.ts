"use server";

import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function crearClub(formData: FormData) {
  if (!(await isAdmin())) return { error: "No autorizado" };

  const nombre = String(formData.get("nombre") ?? "").trim();
  const direccion = String(formData.get("direccion") ?? "").trim();
  const contacto = String(formData.get("contacto") ?? "").trim();
  const logo_url = String(formData.get("logo_url") ?? "").trim();
  if (!nombre) return { error: "Falta el nombre" };

  const supabase = createAdminClient();
  const { error } = await supabase.from("clubes").insert({
    nombre,
    direccion: direccion || null,
    contacto: contacto || null,
    logo_url: logo_url || null,
  });
  if (error) return { error: error.message };

  revalidatePath("/admin/clubes");
  revalidatePath("/clubes");
}

export async function eliminarClub(id: string) {
  if (!(await isAdmin())) return { error: "No autorizado" };

  const supabase = createAdminClient();
  const { error } = await supabase.from("clubes").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/clubes");
  revalidatePath("/clubes");
}

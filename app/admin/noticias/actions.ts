"use server";

import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/admin";

function slugify(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function crearNoticia(formData: FormData) {
  if (!(await isAdmin())) return { error: "No autorizado" };

  const titulo = String(formData.get("titulo") ?? "").trim();
  const resumen = String(formData.get("resumen") ?? "").trim();
  const contenido = String(formData.get("contenido") ?? "").trim();
  const imagen_url = String(formData.get("imagen_url") ?? "").trim();
  const publicado = formData.get("publicado") === "on";
  if (!titulo) return { error: "Falta el título" };

  const supabase = createAdminClient();
  const { error } = await supabase.from("noticias").insert({
    titulo,
    slug: `${slugify(titulo)}-${Date.now().toString(36)}`,
    resumen: resumen || null,
    contenido: contenido || null,
    imagen_url: imagen_url || null,
    publicado,
  });
  if (error) return { error: error.message };

  revalidatePath("/admin/noticias");
  revalidatePath("/noticias");
  revalidatePath("/");
}

export async function eliminarNoticia(id: string) {
  if (!(await isAdmin())) return { error: "No autorizado" };

  const supabase = createAdminClient();
  const { error } = await supabase.from("noticias").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/noticias");
  revalidatePath("/noticias");
  revalidatePath("/");
}

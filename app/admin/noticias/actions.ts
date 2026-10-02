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

export async function actualizarNoticia(id: string, formData: FormData) {
  if (!(await isAdmin())) return { error: "No autorizado" };

  const titulo = String(formData.get("titulo") ?? "").trim();
  const resumen = String(formData.get("resumen") ?? "").trim();
  const contenido = String(formData.get("contenido") ?? "").trim();
  const imagen_url = String(formData.get("imagen_url") ?? "").trim();
  if (!titulo) return { error: "Falta el título" };

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("noticias")
    .update({
      titulo,
      resumen: resumen || null,
      contenido: contenido || null,
      imagen_url: imagen_url || null,
    })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/noticias");
  revalidatePath("/noticias");
  revalidatePath("/");
}

export async function alternarPublicado(id: string, publicado: boolean) {
  if (!(await isAdmin())) return { error: "No autorizado" };

  const supabase = createAdminClient();
  const { error } = await supabase.from("noticias").update({ publicado }).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/noticias");
  revalidatePath("/noticias");
  revalidatePath("/");
}

// Borra el collage guardado de una noticia (og/noticias/<slug>-<hash>.png) para
// que la próxima vez que se pida /api/noticia-imagen/<slug> se genere de nuevo.
// La regeneración la dispara el navegador (no se puede desde acá: el Worker no
// puede hacerse fetch a sí mismo).
export async function borrarImagenRedes(slug: string) {
  if (!(await isAdmin())) return { error: "No autorizado" };
  if (!slug) return { error: "Falta el slug" };

  const supabase = createAdminClient();
  const { data: archivos, error: errLista } = await supabase.storage
    .from("imagenes")
    .list("og/noticias", { search: slug, limit: 100 });
  if (errLista) return { error: errLista.message };

  const rutas = (archivos ?? [])
    .filter((a) => a.name.startsWith(`${slug}-`))
    .map((a) => `og/noticias/${a.name}`);

  if (rutas.length > 0) {
    const { error } = await supabase.storage.from("imagenes").remove(rutas);
    if (error) return { error: error.message };
  }

  return { ok: true as const, borrados: rutas.length };
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

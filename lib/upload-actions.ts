"use server";

import { isAdmin } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { puedeSubirPlanilla } from "@/lib/permisos-zona";

// Solo imágenes rasterizadas: un SVG o un HTML subido al bucket público podría
// ejecutar código al abrirse. La extensión sale del tipo, no del nombre del archivo.
const TIPOS_IMAGEN: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};
const CARPETAS_IMAGEN = new Set(["clubes", "sponsors", "noticias", "otros"]);

/**
 * Sube una imagen al bucket 'imagenes' (público) vía service-role, evitando
 * depender de las políticas RLS de Storage para el cliente autenticado.
 * Solo el admin (logos de clubes y sponsors, fotos de noticias).
 */
export async function subirImagen(formData: FormData) {
  if (!(await isAdmin())) return { error: "No autorizado" };

  const file = formData.get("file") as File | null;
  const pathPrefix = String(formData.get("pathPrefix") ?? "otros");
  if (!file) return { error: "Falta el archivo" };

  const ext = TIPOS_IMAGEN[file.type];
  if (!ext) return { error: "Formato no permitido (usá PNG, JPG o WEBP)" };
  if (!CARPETAS_IMAGEN.has(pathPrefix)) return { error: "Carpeta no permitida" };

  const path = `${pathPrefix}/${Date.now()}.${ext}`;

  const supabase = createAdminClient();
  const { error } = await supabase.storage
    .from("imagenes")
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) return { error: error.message };

  const { data } = supabase.storage.from("imagenes").getPublicUrl(path);
  return { url: data.publicUrl };
}

/**
 * Sube un archivo al bucket 'documentos' (privado: planillas) vía service-role.
 */
export async function subirDocumento(formData: FormData) {
  const file = formData.get("file") as File | null;
  const path = String(formData.get("path") ?? "");
  if (!file || !path) return { error: "Faltan datos" };

  if (!(await puedeSubirPlanilla(path))) return { error: "No autorizado" };
  // Se mira el contenido real (todo PDF empieza con "%PDF"), no solo el tipo declarado.
  const cabecera = new TextDecoder().decode(await file.slice(0, 5).arrayBuffer());
  if (!cabecera.startsWith("%PDF")) return { error: "Solo se aceptan PDF" };

  const supabase = createAdminClient();
  const { error } = await supabase.storage
    .from("documentos")
    .upload(path, file, { contentType: "application/pdf", upsert: true });

  if (error) return { error: error.message };

  return { path };
}

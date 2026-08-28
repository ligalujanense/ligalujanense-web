"use server";

import { getUsuario } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Sube un archivo al bucket 'imagenes' (público) vía service-role, evitando
 * depender de las políticas RLS de Storage para el cliente autenticado.
 * Cualquier usuario logueado (admin o encargado_zona) puede subir imágenes.
 */
export async function subirImagen(formData: FormData) {
  const usuario = await getUsuario();
  if (!usuario) return { error: "No autorizado" };

  const file = formData.get("file") as File | null;
  const pathPrefix = String(formData.get("pathPrefix") ?? "otros");
  if (!file) return { error: "Falta el archivo" };

  const ext = file.name.split(".").pop();
  const path = `${pathPrefix}/${Date.now()}.${ext}`;

  const supabase = createAdminClient();
  const { error } = await supabase.storage
    .from("imagenes")
    .upload(path, file, { upsert: true });

  if (error) return { error: error.message };

  const { data } = supabase.storage.from("imagenes").getPublicUrl(path);
  return { url: data.publicUrl };
}

/**
 * Sube un archivo al bucket 'documentos' (privado: fixture/planillas) vía service-role.
 */
export async function subirDocumento(formData: FormData) {
  const usuario = await getUsuario();
  if (!usuario) return { error: "No autorizado" };

  const file = formData.get("file") as File | null;
  const path = String(formData.get("path") ?? "");
  if (!file || !path) return { error: "Faltan datos" };

  const supabase = createAdminClient();
  const { error } = await supabase.storage
    .from("documentos")
    .upload(path, file, { upsert: true });

  if (error) return { error: error.message };

  return { path };
}

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
  const { data: ultimos } = await supabase
    .from("autoridades")
    .select("orden")
    .order("orden", { ascending: false })
    .limit(1);
  const orden = ((ultimos?.[0]?.orden as number | null) ?? -1) + 1;

  const { error } = await supabase.from("autoridades").insert({ nombre, cargo, orden });
  if (error) return { error: error.message };

  revalidatePath("/admin/autoridades");
  revalidatePath("/institucional");
}

export async function editarAutoridad(id: string, formData: FormData) {
  if (!(await isAdmin())) return { error: "No autorizado" };

  const nombre = String(formData.get("nombre") ?? "").trim();
  const cargo = String(formData.get("cargo") ?? "").trim();
  if (!nombre || !cargo) return { error: "Faltan datos" };

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("autoridades")
    .update({ nombre, cargo })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/autoridades");
  revalidatePath("/institucional");
}

export async function moverAutoridad(id: string, direccion: "arriba" | "abajo") {
  if (!(await isAdmin())) return { error: "No autorizado" };

  const supabase = createAdminClient();
  const { data: todas, error: errLeer } = await supabase
    .from("autoridades")
    .select("id, nombre, orden");
  if (errLeer || !todas) return { error: errLeer?.message ?? "No se pudo leer" };

  const lista = [...todas].sort(
    (a, b) =>
      ((a.orden as number | null) ?? 0) - ((b.orden as number | null) ?? 0) ||
      String(a.nombre).localeCompare(String(b.nombre))
  );

  const i = lista.findIndex((s) => s.id === id);
  const j = direccion === "arriba" ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= lista.length) return; // ya está en el borde

  [lista[i], lista[j]] = [lista[j], lista[i]];

  for (let k = 0; k < lista.length; k++) {
    const { error } = await supabase
      .from("autoridades")
      .update({ orden: k })
      .eq("id", lista[k].id);
    if (error) return { error: error.message };
  }

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

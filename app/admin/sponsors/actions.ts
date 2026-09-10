"use server";

import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function crearSponsor(formData: FormData) {
  if (!(await isAdmin())) return { error: "No autorizado" };

  const nombre = String(formData.get("nombre") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();
  const logo_url = String(formData.get("logo_url") ?? "").trim();
  const fila = Number(formData.get("fila")) === 2 ? 2 : 1;
  if (!nombre) return { error: "Falta el nombre" };

  const supabase = createAdminClient();
  const { data: ultimos } = await supabase
    .from("sponsors")
    .select("orden")
    .order("orden", { ascending: false })
    .limit(1);
  const orden = ((ultimos?.[0]?.orden as number | null) ?? -1) + 1;

  const { error } = await supabase.from("sponsors").insert({
    nombre,
    url: url || null,
    logo_url: logo_url || null,
    fila,
    orden,
  });
  if (error) return { error: error.message };

  revalidatePath("/admin/sponsors");
  revalidatePath("/");
}

export async function editarSponsor(id: string, formData: FormData) {
  if (!(await isAdmin())) return { error: "No autorizado" };

  const nombre = String(formData.get("nombre") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();
  const logo_url = String(formData.get("logo_url") ?? "").trim();
  const fila = Number(formData.get("fila")) === 2 ? 2 : 1;
  if (!nombre) return { error: "Falta el nombre" };

  const datos: Record<string, unknown> = { nombre, url: url || null, fila };
  // Solo se pisa el logo si se subió uno nuevo en este envío.
  if (logo_url) datos.logo_url = logo_url;

  const supabase = createAdminClient();
  const { error } = await supabase.from("sponsors").update(datos).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/sponsors");
  revalidatePath("/");
}

export async function cambiarFilaSponsor(id: string, fila: number) {
  if (!(await isAdmin())) return { error: "No autorizado" };

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("sponsors")
    .update({ fila: fila === 2 ? 2 : 1 })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/sponsors");
  revalidatePath("/");
}

export async function moverSponsor(id: string, direccion: "arriba" | "abajo") {
  if (!(await isAdmin())) return { error: "No autorizado" };

  const supabase = createAdminClient();
  const { data: todos, error: errLeer } = await supabase
    .from("sponsors")
    .select("id, nombre, fila, orden");
  if (errLeer || !todos) return { error: errLeer?.message ?? "No se pudo leer" };

  const actual = todos.find((s) => s.id === id);
  if (!actual) return { error: "Sponsor no encontrado" };

  const fila = (actual.fila as number | null) ?? 1;
  const grupo = todos
    .filter((s) => ((s.fila as number | null) ?? 1) === fila)
    .sort(
      (a, b) =>
        ((a.orden as number | null) ?? 0) - ((b.orden as number | null) ?? 0) ||
        String(a.nombre).localeCompare(String(b.nombre))
    );

  const i = grupo.findIndex((s) => s.id === id);
  const j = direccion === "arriba" ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= grupo.length) return; // ya está en el borde

  [grupo[i], grupo[j]] = [grupo[j], grupo[i]];

  for (let k = 0; k < grupo.length; k++) {
    const { error } = await supabase.from("sponsors").update({ orden: k }).eq("id", grupo[k].id);
    if (error) return { error: error.message };
  }

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

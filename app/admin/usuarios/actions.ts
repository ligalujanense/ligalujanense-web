"use server";

import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function crearEncargado(formData: FormData) {
  if (!(await isAdmin())) return { error: "No autorizado" };

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const rol = String(formData.get("rol") ?? "encargado_zona") as "admin" | "encargado_zona";
  const zona_id = String(formData.get("zona_id") ?? "") || null;

  if (!email || !password) return { error: "Faltan datos" };
  if (rol === "encargado_zona" && !zona_id) return { error: "Elegí una zona" };

  const supabase = createAdminClient();
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) return { error: error.message };

  const { error: insertError } = await supabase.from("usuarios").insert({
    id: data.user.id,
    email,
    rol,
    zona_id: rol === "encargado_zona" ? zona_id : null,
  });
  if (insertError) return { error: insertError.message };

  revalidatePath("/admin/usuarios");
}

export async function eliminarUsuario(id: string) {
  if (!(await isAdmin())) return { error: "No autorizado" };

  const supabase = createAdminClient();
  await supabase.from("usuarios").delete().eq("id", id);
  await supabase.auth.admin.deleteUser(id);

  revalidatePath("/admin/usuarios");
}

"use server";

import { revalidatePath } from "next/cache";
import { getUser } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function actualizarNombre(formData: FormData) {
  const user = await getUser();
  if (!user) return { error: "No autorizado" };

  const nombre = String(formData.get("nombre") ?? "").trim();

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("usuarios")
    .update({ nombre: nombre || null })
    .eq("id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/admin/cuenta");
  revalidatePath("/admin");
}

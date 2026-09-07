"use server";

import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function guardarIntroduccion(formData: FormData) {
  if (!(await isAdmin())) return { error: "No autorizado" };

  const contenido = String(formData.get("contenido") ?? "");

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("institucional")
    .upsert({ id: "main", contenido, updated_at: new Date().toISOString() });
  if (error) return { error: error.message };

  revalidatePath("/admin/institucional");
  revalidatePath("/institucional");
}

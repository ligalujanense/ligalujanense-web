import { createAdminClient } from "@/lib/supabase/admin";
import { UsuariosAdminList } from "./UsuariosAdminList";

export default async function UsuariosAdminPage() {
  const supabase = createAdminClient();
  const [{ data: usuarios }, { data: zonas }] = await Promise.all([
    supabase.from("usuarios").select("id, email, rol, zona_id").order("email"),
    supabase.from("zonas").select("id, nombre").order("nombre"),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Usuarios y roles</h1>
      <UsuariosAdminList usuarios={usuarios ?? []} zonas={zonas ?? []} />
    </div>
  );
}

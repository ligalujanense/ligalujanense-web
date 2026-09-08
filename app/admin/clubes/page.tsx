import { createAdminClient } from "@/lib/supabase/admin";
import { ClubesAdminList } from "./ClubesAdminList";

export default async function ClubesAdminPage() {
  const supabase = createAdminClient();
  const { data: clubes } = await supabase
    .from("clubes")
    .select("id, nombre, direccion, contacto, logo_url, link")
    .order("nombre");

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Clubes</h1>
      <ClubesAdminList clubes={clubes ?? []} />
    </div>
  );
}

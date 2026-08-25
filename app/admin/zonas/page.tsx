import { createAdminClient } from "@/lib/supabase/admin";
import { ZonasAdminList } from "./ZonasAdminList";

export default async function ZonasAdminPage() {
  const supabase = createAdminClient();
  const { data: zonas } = await supabase
    .from("zonas")
    .select("id, nombre, temporada")
    .order("nombre");

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <h1 className="text-2xl font-bold">Zonas</h1>
      <ZonasAdminList zonas={zonas ?? []} />
    </div>
  );
}

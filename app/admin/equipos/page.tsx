import { createAdminClient } from "@/lib/supabase/admin";
import { EquiposAdminList } from "./EquiposAdminList";

export default async function EquiposAdminPage() {
  const supabase = createAdminClient();
  const [{ data: equipos }, { data: clubes }, { data: zonas }] = await Promise.all([
    supabase.from("equipos").select("id, club_id, zona_id"),
    supabase.from("clubes").select("id, nombre").order("nombre"),
    supabase.from("zonas").select("id, nombre").order("nombre"),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Equipos por zona</h1>
      <EquiposAdminList equipos={equipos ?? []} clubes={clubes ?? []} zonas={zonas ?? []} />
    </div>
  );
}

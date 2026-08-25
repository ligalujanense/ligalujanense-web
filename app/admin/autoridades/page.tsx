import { createAdminClient } from "@/lib/supabase/admin";
import { AutoridadesAdminList } from "./AutoridadesAdminList";

export default async function AutoridadesAdminPage() {
  const supabase = createAdminClient();
  const { data: autoridades } = await supabase
    .from("autoridades")
    .select("id, nombre, cargo")
    .order("orden");

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Autoridades</h1>
      <AutoridadesAdminList autoridades={autoridades ?? []} />
    </div>
  );
}

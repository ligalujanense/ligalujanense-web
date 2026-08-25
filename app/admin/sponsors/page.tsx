import { createAdminClient } from "@/lib/supabase/admin";
import { SponsorsAdminList } from "./SponsorsAdminList";

export default async function SponsorsAdminPage() {
  const supabase = createAdminClient();
  const { data: sponsors } = await supabase
    .from("sponsors")
    .select("id, nombre, url")
    .order("orden");

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Sponsors</h1>
      <SponsorsAdminList sponsors={sponsors ?? []} />
    </div>
  );
}

import { createAdminClient } from "@/lib/supabase/admin";
import { NoticiasAdminList } from "./NoticiasAdminList";

export default async function NoticiasAdminPage() {
  const supabase = createAdminClient();
  const { data: noticias } = await supabase
    .from("noticias")
    .select("id, titulo, publicado")
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Noticias</h1>
      <NoticiasAdminList noticias={noticias ?? []} />
    </div>
  );
}

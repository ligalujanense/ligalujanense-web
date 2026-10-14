import { createAdminClient } from "@/lib/supabase/admin";
import { NoticiasTable } from "./NoticiasTable";

export default async function NoticiasAdminPage() {
  const supabase = createAdminClient();
  const { data: noticias } = await supabase
    .from("noticias")
    .select("id, titulo, resumen, contenido, imagen_url, publicado, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold">Noticias</h1>
        <p className="text-neutral-500 text-sm">{noticias?.length ?? 0} artículos</p>
      </div>
      <NoticiasTable noticias={noticias ?? []} />
    </div>
  );
}

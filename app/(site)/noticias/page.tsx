import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function NoticiasPage() {
  const supabase = await createClient();
  const { data: noticias } = await supabase
    .from("noticias")
    .select("id, titulo, slug, resumen, created_at")
    .eq("publicado", true)
    .order("created_at", { ascending: false });

  return (
    <main className="max-w-5xl mx-auto px-4 py-10 flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-dorado-oscuro">Noticias</h1>

      {noticias && noticias.length > 0 ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {noticias.map((noticia) => (
            <Link
              key={noticia.id}
              href={`/noticias/${noticia.slug}`}
              className="border border-neutral-200 rounded-lg p-4 hover:border-dorado transition-colors"
            >
              <p className="font-semibold">{noticia.titulo}</p>
              {noticia.resumen && (
                <p className="text-sm text-neutral-500 mt-1 line-clamp-2">
                  {noticia.resumen}
                </p>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-neutral-500 text-sm">Todavía no hay noticias publicadas.</p>
      )}
    </main>
  );
}

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function NoticiasPage() {
  const supabase = await createClient();
  const { data: noticias } = await supabase
    .from("noticias")
    .select("id, titulo, slug, resumen, created_at, imagen_url")
    .eq("publicado", true)
    .order("created_at", { ascending: false });

  return (
    <main className="max-w-5xl mx-auto px-4 py-10 flex flex-col gap-6">
      <div>
        <span className="uppercase tracking-widest text-xs font-bold text-dorado-oscuro">
          Noticias
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-celeste-oscuro">Novedades de la liga</h1>
      </div>

      {noticias && noticias.length > 0 ? (
        <div className="grid sm:grid-cols-2 gap-5">
          {noticias.map((noticia) => (
            <Link
              key={noticia.id}
              href={`/noticias/${noticia.slug}`}
              className="group flex flex-col bg-white border border-neutral-200 rounded-xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              {noticia.imagen_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={noticia.imagen_url} alt={noticia.titulo} className="h-40 w-full object-cover" />
              ) : (
                <div className="h-32 bg-gradient-to-br from-dorado-oscuro to-dorado flex items-center justify-center">
                  <span className="text-white font-black text-xs uppercase tracking-widest">
                    Liga Lujanense
                  </span>
                </div>
              )}
              <div className="p-4 flex flex-col gap-1">
                <p className="font-bold text-celeste-oscuro group-hover:text-dorado-oscuro transition-colors line-clamp-2">
                  {noticia.titulo}
                </p>
                {noticia.resumen && (
                  <p className="text-sm text-neutral-500 line-clamp-2">{noticia.resumen}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-neutral-500 text-sm">Todavía no hay noticias publicadas.</p>
      )}
    </main>
  );
}

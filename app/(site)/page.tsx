import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();

  const [{ data: noticias }, { data: sponsors }, { data: zonas }] =
    await Promise.all([
      supabase
        .from("noticias")
        .select("id, titulo, slug, resumen, created_at")
        .eq("publicado", true)
        .order("created_at", { ascending: false })
        .limit(3),
      supabase.from("sponsors").select("id, nombre, logo_url, url").order("orden"),
      supabase.from("zonas").select("id, nombre, temporada").order("nombre"),
    ]);

  return (
    <main className="max-w-5xl mx-auto px-4 py-10 flex flex-col gap-12">
      <section className="text-center flex flex-col gap-3 py-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-dorado-oscuro">
          Liga Lujanense de Fútbol
        </h1>
        <p className="text-neutral-600">
          Noticias, fixture, tabla de posiciones y clubes afiliados.
        </p>
      </section>

      {zonas && zonas.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold">Zonas</h2>
          <div className="flex flex-wrap gap-3">
            {zonas.map((zona) => (
              <Link
                key={zona.id}
                href={`/posiciones/${zona.id}`}
                className="border border-neutral-200 rounded-lg px-4 py-3 hover:border-dorado transition-colors"
              >
                <p className="font-semibold">{zona.nombre}</p>
                <p className="text-sm text-neutral-500">{zona.temporada}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Últimas noticias</h2>
          <Link href="/noticias" className="text-sm text-dorado-oscuro hover:underline">
            Ver todas
          </Link>
        </div>
        {noticias && noticias.length > 0 ? (
          <div className="grid sm:grid-cols-3 gap-4">
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
      </section>

      {sponsors && sponsors.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold">Sponsors</h2>
          <div className="flex flex-wrap items-center gap-6">
            {sponsors.map((sponsor) => (
              <a
                key={sponsor.id}
                href={sponsor.url ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-neutral-600 hover:text-dorado-oscuro"
              >
                {sponsor.nombre}
              </a>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

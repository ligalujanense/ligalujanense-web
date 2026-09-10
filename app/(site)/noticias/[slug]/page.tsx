import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ShareButtons } from "@/components/site/ShareButtons";
import { CompartirImagenButton } from "@/components/site/CompartirImagenButton";

export default async function NoticiaDetallePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: noticia } = await supabase
    .from("noticias")
    .select("titulo, contenido, imagen_url, created_at")
    .eq("slug", slug)
    .eq("publicado", true)
    .single();

  if (!noticia) notFound();

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 flex flex-col gap-4">
      <span className="uppercase tracking-widest text-xs font-bold text-dorado-oscuro">
        Noticias
      </span>
      <h1 className="text-2xl sm:text-3xl font-extrabold text-celeste-oscuro">{noticia.titulo}</h1>
      <div className="flex flex-wrap items-center gap-3">
        <CompartirImagenButton
          endpoint={`/api/noticia-imagen/${slug}`}
          titulo={noticia.titulo}
          nombreBase={noticia.titulo}
          cacheBust={false}
        />
        <ShareButtons title={noticia.titulo} path={`/noticias/${slug}`} />
      </div>
      {noticia.imagen_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={noticia.imagen_url}
          alt={noticia.titulo}
          className="rounded-xl w-full object-cover max-h-96"
        />
      ) : (
        <div className="h-48 rounded-xl bg-gradient-to-br from-dorado-oscuro to-dorado flex items-center justify-center">
          <span className="text-white font-black text-sm uppercase tracking-widest">
            Liga Lujanense
          </span>
        </div>
      )}
      {noticia.contenido && (
        <div className="whitespace-pre-line text-neutral-700 leading-relaxed">
          {noticia.contenido}
        </div>
      )}
    </main>
  );
}

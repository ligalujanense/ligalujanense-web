import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ShareButtons } from "@/components/site/ShareButtons";

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
      <h1 className="text-2xl font-bold text-dorado-oscuro">{noticia.titulo}</h1>
      <ShareButtons title={noticia.titulo} path={`/noticias/${slug}`} />
      {noticia.imagen_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={noticia.imagen_url}
          alt={noticia.titulo}
          className="rounded-lg w-full object-cover max-h-96"
        />
      )}
      {noticia.contenido && (
        <div className="whitespace-pre-line text-neutral-700">
          {noticia.contenido}
        </div>
      )}
    </main>
  );
}

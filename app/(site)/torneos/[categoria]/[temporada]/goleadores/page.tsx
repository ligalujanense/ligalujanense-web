import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { encontrarCategoria } from "@/lib/torneos";
import { goleadorAnualDeTemporada } from "@/lib/goleadores-data";
import { TablaGoleadores } from "@/components/site/TablaGoleadores";
import { ShareButtons } from "@/components/site/ShareButtons";

export const metadata = { title: "Goleadores" };

export default async function GoleadorAnualPage({
  params,
}: {
  params: Promise<{ categoria: string; temporada: string }>;
}) {
  const { categoria, temporada } = await params;
  const cat = encontrarCategoria(categoria);
  if (!cat || !cat.temporadas.includes(temporada)) notFound();

  const supabase = await createClient();
  const { filas, hayFaseFinal } = await goleadorAnualDeTemporada(supabase, cat.slug, temporada);

  return (
    <main className="max-w-5xl mx-auto px-4 py-10 flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <Link
            href={`/torneos/${cat.slug}/${temporada}`}
            className="text-xs font-semibold text-celeste-oscuro hover:underline"
          >
            ← Torneos · {cat.label} · {temporada}
          </Link>
          <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-celeste-oscuro">
            Goleadores
          </h1>
        </div>
        {filas.length > 0 && (
          <ShareButtons
            title={`Goleadores ${temporada}`}
            path={`/torneos/${cat.slug}/${temporada}/goleadores`}
            imagen={{
              endpoint: `/api/goleadores-imagen/anual/${cat.slug}/${temporada}`,
              nombreBase: `Goleadores ${temporada}`,
            }}
          />
        )}
      </div>

      {filas.length === 0 ? (
        <p className="text-neutral-500 text-sm">Todavía no hay goleadores cargados.</p>
      ) : (
        <>
          <TablaGoleadores filas={filas} top={10} desglose={hayFaseFinal} />
        </>
      )}
    </main>
  );
}

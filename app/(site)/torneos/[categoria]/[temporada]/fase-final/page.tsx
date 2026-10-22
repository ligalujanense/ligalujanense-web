import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { encontrarCategoria } from "@/lib/torneos";
import { cargarCuadro } from "@/lib/fase-final-data";
import { CuadroFaseFinal } from "@/components/site/CuadroFaseFinal";

export const metadata = { title: "Fase final" };

export default async function FaseFinalPage({
  params,
}: {
  params: Promise<{ categoria: string; temporada: string }>;
}) {
  const { categoria, temporada } = await params;
  const cat = encontrarCategoria(categoria);
  if (!cat || !cat.temporadas.includes(temporada)) notFound();

  const supabase = await createClient();
  const { cruces } = await cargarCuadro(supabase, cat.slug, temporada);

  return (
    <main className="max-w-6xl mx-auto px-4 py-10 flex flex-col gap-6">
      <div>
        <Link
          href={`/torneos/${cat.slug}/${temporada}`}
          className="text-xs font-semibold text-celeste-oscuro hover:underline"
        >
          ← Torneos · {cat.label} · {temporada}
        </Link>
        <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-celeste-oscuro">
          Fase final {temporada}
        </h1>
        <p className="text-sm text-neutral-500">
          Cruces de ida y vuelta. Pasa de ronda quien tenga mejor global; si hay empate, se define
          por penales.
        </p>
      </div>

      {cruces.length > 0 ? (
        <CuadroFaseFinal cruces={cruces} />
      ) : (
        <p className="text-neutral-500 text-sm">Todavía no se cargaron los cruces.</p>
      )}
    </main>
  );
}

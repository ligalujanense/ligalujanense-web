import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { encontrarCategoria } from "@/lib/torneos";

export default async function TorneoTemporadaPage({
  params,
}: {
  params: Promise<{ categoria: string; temporada: string }>;
}) {
  const { categoria, temporada } = await params;
  const cat = encontrarCategoria(categoria);
  if (!cat || !cat.temporadas.includes(temporada)) notFound();

  const supabase = await createClient();
  const { data: zonas } = await supabase
    .from("zonas")
    .select("id, nombre, temporada")
    .eq("categoria", cat.slug)
    .eq("temporada", temporada)
    .order("nombre");

  return (
    <main className="max-w-5xl mx-auto px-4 py-10 flex flex-col gap-6">
      <div>
        <span className="uppercase tracking-widest text-xs font-bold text-dorado-oscuro">
          Torneos · {cat.label}
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-celeste-oscuro">
          Temporada {temporada}
        </h1>
      </div>

      {zonas && zonas.length > 0 ? (
        <div className="flex flex-col gap-3">
          {zonas.map((zona) => (
            <div
              key={zona.id}
              className="bg-white border border-neutral-200 rounded-xl px-5 py-4 flex items-center justify-between flex-wrap gap-3"
            >
              <p className="font-bold text-celeste-oscuro">{zona.nombre}</p>
              <div className="flex gap-2">
                <Link
                  href={`/fixture/${zona.id}`}
                  className="bg-celeste-oscuro hover:bg-celeste text-white text-sm font-semibold rounded-full px-4 py-2 transition-colors"
                >
                  Fixture
                </Link>
                <Link
                  href={`/posiciones/${zona.id}`}
                  className="bg-dorado hover:bg-dorado-oscuro text-white text-sm font-semibold rounded-full px-4 py-2 transition-colors"
                >
                  Posiciones
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-neutral-500 text-sm">
          Todavía no hay zonas cargadas para esta temporada.
        </p>
      )}
    </main>
  );
}

import { notFound } from "next/navigation";
import Link from "next/link";
import { encontrarCategoria } from "@/lib/torneos";

export default async function TorneoCategoriaPage({
  params,
}: {
  params: Promise<{ categoria: string }>;
}) {
  const { categoria } = await params;
  const cat = encontrarCategoria(categoria);
  if (!cat) notFound();

  return (
    <main className="max-w-5xl mx-auto px-4 py-10 flex flex-col gap-6">
      <div>
        <span className="uppercase tracking-widest text-xs font-bold text-dorado-oscuro">
          Torneos
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-celeste-oscuro">{cat.label}</h1>
      </div>

      <div className="flex flex-wrap gap-3">
        {cat.temporadas.map((temporada) => (
          <Link
            key={temporada}
            href={`/torneos/${cat.slug}/${temporada}`}
            className="bg-white border border-neutral-200 rounded-xl px-5 py-4 hover:border-dorado hover:shadow-md transition-all min-w-[160px]"
          >
            <p className="font-bold text-celeste-oscuro">Temporada {temporada}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}

import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { encontrarCategoria } from "@/lib/torneos";
import { goleadorAnualDeTemporada } from "@/lib/goleadores-data";
import { formatearNombre } from "@/lib/goleadores";
import { TablaGoleadores } from "@/components/site/TablaGoleadores";
import { ShareButtons } from "@/components/site/ShareButtons";

export const metadata = { title: "Goleador anual" };

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
  const lideres = filas.filter((f) => f.puesto === 1);

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
            Goleador anual {temporada}
          </h1>
        </div>
        {filas.length > 0 && (
          <ShareButtons
            title={`Goleador anual ${temporada}`}
            path={`/torneos/${cat.slug}/${temporada}/goleadores`}
            imagen={{
              endpoint: `/api/goleadores-imagen/anual/${cat.slug}/${temporada}`,
              nombreBase: `Goleador anual ${temporada}`,
            }}
          />
        )}
      </div>

      {filas.length === 0 ? (
        <p className="text-neutral-500 text-sm">Todavía no hay goleadores cargados.</p>
      ) : (
        <>
          <div className="rounded-2xl border border-dorado/40 bg-dorado/10 p-5 flex flex-col gap-3">
            <span className="uppercase tracking-widest text-xs font-bold text-dorado-oscuro">
              {lideres.length > 1 ? "Empatados en la cima" : "Va liderando"}
            </span>
            <div className="flex flex-wrap gap-x-8 gap-y-3">
              {lideres.map((l) => (
                <div key={`${l.jugador}-${l.club}`} className="flex items-center gap-3">
                  {l.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={l.logo} alt="" className="w-10 h-10 object-contain shrink-0" />
                  ) : (
                    <span className="w-10 h-10 rounded-full bg-celeste-oscuro/10 text-celeste-oscuro flex items-center justify-center font-bold shrink-0">
                      {l.club.charAt(0)}
                    </span>
                  )}
                  <div className="leading-tight">
                    <p className="font-extrabold text-celeste-oscuro">{formatearNombre(l.jugador)}</p>
                    <p className="text-sm text-neutral-600">{l.club}</p>
                  </div>
                </div>
              ))}
              <p className="text-4xl font-extrabold text-celeste-oscuro self-center">
                {lideres[0].goles} <span className="text-base font-bold text-neutral-500">goles</span>
              </p>
            </div>
          </div>

          <TablaGoleadores filas={filas} hastaPuesto={10} desglose={hayFaseFinal} />
        </>
      )}
    </main>
  );
}

import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function FixtureZonaPage({
  params,
}: {
  params: Promise<{ zonaId: string }>;
}) {
  const { zonaId } = await params;
  const supabase = await createClient();

  const { data: zona } = await supabase
    .from("zonas")
    .select("id, nombre, temporada")
    .eq("id", zonaId)
    .single();

  if (!zona) notFound();

  const { data: fechas } = await supabase
    .from("fixture_fechas")
    .select(
      `id, numero_fecha, fecha,
       partidos (
         id, hora, estadio, estado, resultado_local, resultado_visitante,
         equipo_local:equipo_local_id ( id, clubes ( nombre ) ),
         equipo_visitante:equipo_visitante_id ( id, clubes ( nombre ) ),
         libre_equipo:libre_equipo_id ( id, clubes ( nombre ) )
       )`
    )
    .eq("zona_id", zonaId)
    .order("numero_fecha");

  return (
    <main className="max-w-5xl mx-auto px-4 py-10 flex flex-col gap-8">
      <div>
        <span className="uppercase tracking-widest text-xs font-bold text-dorado-oscuro">
          Fixture
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-celeste-oscuro">
          {zona.nombre}
        </h1>
        <p className="text-neutral-500 text-sm">{zona.temporada}</p>
      </div>

      {fechas && fechas.length > 0 ? (
        <div className="flex flex-col gap-8">
          {fechas.map((fecha: any) => (
            <section key={fecha.id} className="flex flex-col gap-3">
              <h2 className="font-bold text-celeste-oscuro flex items-center gap-2">
                <span className="bg-celeste-oscuro text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  Fecha {fecha.numero_fecha}
                </span>
                {fecha.fecha && <span className="text-neutral-500 text-sm font-normal">{fecha.fecha}</span>}
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {fecha.partidos?.map((partido: any) =>
                  partido.libre_equipo ? (
                    <div
                      key={partido.id}
                      className="border border-dashed border-neutral-300 rounded-xl px-4 py-3 text-sm text-neutral-500 flex items-center justify-center"
                    >
                      {partido.libre_equipo.clubes?.nombre ?? "?"} — libre
                    </div>
                  ) : (
                    <div
                      key={partido.id}
                      className="bg-white border border-neutral-200 rounded-xl px-4 py-3 flex items-center justify-between gap-3 hover:border-dorado transition-colors"
                    >
                      <span className="font-semibold text-celeste-oscuro text-sm text-right flex-1">
                        {partido.equipo_local?.clubes?.nombre ?? "?"}
                      </span>
                      <span
                        className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold ${
                          partido.estado === "jugado"
                            ? "bg-celeste-oscuro text-white"
                            : "bg-dorado/15 text-dorado-oscuro"
                        }`}
                      >
                        {partido.estado === "jugado"
                          ? `${partido.resultado_local} - ${partido.resultado_visitante}`
                          : partido.hora?.slice(0, 5) ?? "A definir"}
                      </span>
                      <span className="font-semibold text-celeste-oscuro text-sm flex-1">
                        {partido.equipo_visitante?.clubes?.nombre ?? "?"}
                      </span>
                    </div>
                  )
                )}
                {fecha.partidos?.length === 0 && (
                  <p className="text-neutral-400 text-sm">Sin partidos cargados.</p>
                )}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <p className="text-neutral-500 text-sm">Todavía no hay fixture cargado para esta zona.</p>
      )}
    </main>
  );
}

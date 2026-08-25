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
        <h1 className="text-2xl font-bold text-dorado-oscuro">
          Fixture — {zona.nombre}
        </h1>
        <p className="text-neutral-500 text-sm">{zona.temporada}</p>
      </div>

      {fechas && fechas.length > 0 ? (
        <div className="flex flex-col gap-6">
          {fechas.map((fecha: any) => (
            <section key={fecha.id} className="flex flex-col gap-2">
              <h2 className="font-semibold text-neutral-700">
                Fecha {fecha.numero_fecha}
                {fecha.fecha ? ` — ${fecha.fecha}` : ""}
              </h2>
              <div className="flex flex-col gap-1">
                {fecha.partidos?.map((partido: any) => (
                  <div
                    key={partido.id}
                    className="border border-neutral-200 rounded-lg px-4 py-2 flex items-center justify-between text-sm"
                  >
                    <span>
                      {partido.equipo_local?.clubes?.nombre ?? "?"} vs{" "}
                      {partido.equipo_visitante?.clubes?.nombre ?? "?"}
                    </span>
                    <span className="text-neutral-500">
                      {partido.estado === "jugado"
                        ? `${partido.resultado_local} - ${partido.resultado_visitante}`
                        : partido.hora ?? "A definir"}
                    </span>
                  </div>
                ))}
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

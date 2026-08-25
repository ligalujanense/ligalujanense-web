import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { calcularPosiciones } from "@/lib/posiciones";
import { ShareButtons } from "@/components/site/ShareButtons";

export default async function PosicionesZonaPage({
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

  const { data: equiposRaw } = await supabase
    .from("equipos")
    .select("id, clubes ( nombre )")
    .eq("zona_id", zonaId);

  const equipos = (equiposRaw ?? []).map((equipo: any) => ({
    id: equipo.id,
    nombre: equipo.clubes?.nombre ?? "Equipo",
  }));

  const { data: fechas } = await supabase
    .from("fixture_fechas")
    .select(
      `partidos ( equipo_local_id, equipo_visitante_id, resultado_local, resultado_visitante, estado )`
    )
    .eq("zona_id", zonaId);

  const partidos = (fechas ?? []).flatMap((fecha: any) => fecha.partidos ?? []);
  const tabla = calcularPosiciones(partidos, equipos);

  return (
    <main className="max-w-5xl mx-auto px-4 py-10 flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <span className="uppercase tracking-widest text-xs font-bold text-dorado-oscuro">
            Tabla de posiciones
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-celeste-oscuro">
            {zona.nombre}
          </h1>
          <p className="text-neutral-500 text-sm">{zona.temporada}</p>
        </div>
        <ShareButtons title={`Posiciones ${zona.nombre}`} path={`/posiciones/${zona.id}`} />
      </div>

      {tabla.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-neutral-200 shadow-sm">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-celeste-oscuro text-white text-left">
                <th className="p-3 font-semibold">#</th>
                <th className="p-3 font-semibold">Equipo</th>
                <th className="p-3 text-center font-semibold">PJ</th>
                <th className="p-3 text-center font-semibold">PG</th>
                <th className="p-3 text-center font-semibold">PE</th>
                <th className="p-3 text-center font-semibold">PP</th>
                <th className="p-3 text-center font-semibold">GF</th>
                <th className="p-3 text-center font-semibold">GC</th>
                <th className="p-3 text-center font-semibold">DG</th>
                <th className="p-3 text-center font-bold text-dorado">Pts</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {tabla.map((fila, i) => (
                <tr
                  key={fila.equipo_id}
                  className={`border-b border-neutral-100 last:border-0 ${
                    i === 0 ? "bg-dorado/10" : "hover:bg-neutral-50"
                  }`}
                >
                  <td className="p-3">
                    <span
                      className={`w-6 h-6 inline-flex items-center justify-center rounded-full text-xs font-bold ${
                        i === 0 ? "bg-dorado text-celeste-oscuro" : "text-neutral-500"
                      }`}
                    >
                      {i + 1}
                    </span>
                  </td>
                  <td className="p-3 font-semibold text-celeste-oscuro">{fila.nombre}</td>
                  <td className="p-3 text-center">{fila.pj}</td>
                  <td className="p-3 text-center">{fila.pg}</td>
                  <td className="p-3 text-center">{fila.pe}</td>
                  <td className="p-3 text-center">{fila.pp}</td>
                  <td className="p-3 text-center">{fila.gf}</td>
                  <td className="p-3 text-center">{fila.gc}</td>
                  <td className="p-3 text-center">{fila.dg}</td>
                  <td className="p-3 text-center font-extrabold text-celeste-oscuro">{fila.pts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-neutral-500 text-sm">Todavía no hay equipos cargados en esta zona.</p>
      )}
    </main>
  );
}

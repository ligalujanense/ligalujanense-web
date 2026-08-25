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
          <h1 className="text-2xl font-bold text-dorado-oscuro">
            Posiciones — {zona.nombre}
          </h1>
          <p className="text-neutral-500 text-sm">{zona.temporada}</p>
        </div>
        <ShareButtons title={`Posiciones ${zona.nombre}`} path={`/posiciones/${zona.id}`} />
      </div>

      {tabla.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-dorado/10 text-left">
                <th className="p-2">#</th>
                <th className="p-2">Equipo</th>
                <th className="p-2 text-center">PJ</th>
                <th className="p-2 text-center">PG</th>
                <th className="p-2 text-center">PE</th>
                <th className="p-2 text-center">PP</th>
                <th className="p-2 text-center">GF</th>
                <th className="p-2 text-center">GC</th>
                <th className="p-2 text-center">DG</th>
                <th className="p-2 text-center font-bold">Pts</th>
              </tr>
            </thead>
            <tbody>
              {tabla.map((fila, i) => (
                <tr key={fila.equipo_id} className="border-b border-neutral-100">
                  <td className="p-2">{i + 1}</td>
                  <td className="p-2 font-medium">{fila.nombre}</td>
                  <td className="p-2 text-center">{fila.pj}</td>
                  <td className="p-2 text-center">{fila.pg}</td>
                  <td className="p-2 text-center">{fila.pe}</td>
                  <td className="p-2 text-center">{fila.pp}</td>
                  <td className="p-2 text-center">{fila.gf}</td>
                  <td className="p-2 text-center">{fila.gc}</td>
                  <td className="p-2 text-center">{fila.dg}</td>
                  <td className="p-2 text-center font-bold">{fila.pts}</td>
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

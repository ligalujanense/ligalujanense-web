import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { calcularPosiciones, calcularUltimosResultados } from "@/lib/posiciones";
import { ShareButtons } from "@/components/site/ShareButtons";
import { TablaGoleadores } from "@/components/site/TablaGoleadores";
import { goleadoresDeZona } from "@/lib/goleadores-data";

const COLOR_RESULTADO: Record<string, string> = {
  V: "bg-green-600",
  E: "bg-neutral-400",
  D: "bg-red-600",
};

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
    .select(
      `id, ajuste_pj, ajuste_pg, ajuste_pe, ajuste_pp, ajuste_gf, ajuste_gc, ajuste_pts,
       clubes ( nombre, logo_url )`
    )
    .eq("zona_id", zonaId);

  const equipos = (equiposRaw ?? []).map((equipo: any) => ({
    id: equipo.id,
    nombre: equipo.clubes?.nombre ?? "Equipo",
    logoUrl: equipo.clubes?.logo_url ?? null,
    ajuste: {
      pj: equipo.ajuste_pj ?? 0,
      pg: equipo.ajuste_pg ?? 0,
      pe: equipo.ajuste_pe ?? 0,
      pp: equipo.ajuste_pp ?? 0,
      gf: equipo.ajuste_gf ?? 0,
      gc: equipo.ajuste_gc ?? 0,
      pts: equipo.ajuste_pts ?? 0,
    },
  }));
  const logoPorEquipo = new Map(equipos.map((e) => [e.id, e.logoUrl]));
  // Estas dos funciones dependen del historial partido a partido, que no
  // existe retroactivamente para la temporada 2026 (arrancó con ajuste
  // inicial). Quedan habilitadas de nuevo a partir de la temporada 2027.
  const mostrarUltimos5 = zona.temporada !== "2026";

  const { data: fechas } = await supabase
    .from("fixture_fechas")
    .select(
      `numero_fecha, partidos ( id, equipo_local_id, equipo_visitante_id, resultado_local, resultado_visitante, estado )`
    )
    .eq("zona_id", zonaId);

  const partidos = (fechas ?? []).flatMap((fecha: any) =>
    (fecha.partidos ?? []).map((partido: any) => ({
      ...partido,
      numero_fecha: fecha.numero_fecha,
    }))
  );
  const tabla = calcularPosiciones(partidos, equipos);

  const goleadores = await goleadoresDeZona(supabase, zonaId);

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
        <ShareButtons
          title={`Posiciones ${zona.nombre}`}
          path={`/posiciones/${zona.id}`}
          imagen={{
            endpoint: `/api/posiciones-imagen/${zona.id}`,
            nombreBase: `Posiciones ${zona.nombre}`,
          }}
        />
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
                {mostrarUltimos5 && (
                  <th className="p-3 text-center font-semibold">Últimos 5</th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white">
              {tabla.map((fila, i) => {
                const ultimos = mostrarUltimos5
                  ? calcularUltimosResultados(partidos, fila.equipo_id)
                  : [];
                return (
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
                    <td className="p-3 font-semibold text-celeste-oscuro">
                      <div className="flex items-center gap-2">
                        {logoPorEquipo.get(fila.equipo_id) ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={logoPorEquipo.get(fila.equipo_id)!}
                            alt=""
                            className="w-6 h-6 object-contain shrink-0"
                          />
                        ) : (
                          <span className="w-6 h-6 rounded-full bg-celeste-oscuro/10 text-celeste-oscuro flex items-center justify-center text-[10px] font-bold shrink-0">
                            {fila.nombre.charAt(0)}
                          </span>
                        )}
                        {fila.nombre}
                      </div>
                    </td>
                    <td className="p-3 text-center">{fila.pj}</td>
                    <td className="p-3 text-center">{fila.pg}</td>
                    <td className="p-3 text-center">{fila.pe}</td>
                    <td className="p-3 text-center">{fila.pp}</td>
                    <td className="p-3 text-center">{fila.gf}</td>
                    <td className="p-3 text-center">{fila.gc}</td>
                    <td className="p-3 text-center">{fila.dg}</td>
                    <td className="p-3 text-center font-extrabold text-celeste-oscuro">{fila.pts}</td>
                    {mostrarUltimos5 && (
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-1">
                          {ultimos.length > 0 ? (
                            ultimos.map((resultado, idx) => (
                              <span
                                key={idx}
                                className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold text-white ${COLOR_RESULTADO[resultado]}`}
                              >
                                {resultado}
                              </span>
                            ))
                          ) : (
                            <span className="text-neutral-300 text-xs">—</span>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-neutral-500 text-sm">Todavía no hay equipos cargados en esta zona.</p>
      )}

      {goleadores.length > 0 && (
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="text-xl sm:text-2xl font-extrabold text-celeste-oscuro">Goleadores</h2>
            <ShareButtons
              title={`Goleadores ${zona.nombre}`}
              path={`/posiciones/${zona.id}`}
              imagen={{
                endpoint: `/api/goleadores-imagen/zona/${zona.id}`,
                nombreBase: `Goleadores ${zona.nombre}`,
              }}
            />
          </div>
          <TablaGoleadores filas={goleadores} />
        </section>
      )}
    </main>
  );
}

import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FechaCard, type PartidoFechaCard } from "@/components/site/FechaCard";

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
         equipo_local:equipo_local_id ( clubes ( nombre, logo_url ) ),
         equipo_visitante:equipo_visitante_id ( clubes ( nombre, logo_url ) ),
         libre_equipo:libre_equipo_id ( clubes ( nombre ) )
       )`
    )
    .eq("zona_id", zonaId)
    .order("numero_fecha");

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 flex flex-col gap-8">
      <div className="text-center">
        <span className="uppercase tracking-widest text-xs font-bold text-dorado-oscuro">
          Fixture
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-celeste-oscuro">
          {zona.nombre}
        </h1>
        <p className="text-neutral-500 text-sm">{zona.temporada}</p>
      </div>

      {fechas && fechas.length > 0 ? (
        <div className="flex flex-col gap-10">
          {fechas.map((fecha: any) => {
            const fechaTexto: string | null = fecha.fecha
              ? new Date(
                  Number(fecha.fecha.slice(0, 4)),
                  Number(fecha.fecha.slice(5, 7)) - 1,
                  Number(fecha.fecha.slice(8, 10))
                ).toLocaleDateString("es-AR", { weekday: "long", day: "2-digit", month: "long" })
              : null;

            const partidos: PartidoFechaCard[] = (fecha.partidos ?? []).map((partido: any) => ({
              id: partido.id,
              hora: partido.hora,
              estadio: partido.estadio,
              estado: partido.estado,
              resultado_local: partido.resultado_local,
              resultado_visitante: partido.resultado_visitante,
              local: partido.equipo_local?.clubes
                ? { nombre: partido.equipo_local.clubes.nombre, logoUrl: partido.equipo_local.clubes.logo_url }
                : null,
              visitante: partido.equipo_visitante?.clubes
                ? { nombre: partido.equipo_visitante.clubes.nombre, logoUrl: partido.equipo_visitante.clubes.logo_url }
                : null,
              libreNombre: partido.libre_equipo?.clubes?.nombre ?? null,
            }));

            return (
              <FechaCard
                key={fecha.id}
                zonaNombre={zona.nombre}
                numeroFecha={fecha.numero_fecha}
                fechaTexto={fechaTexto}
                partidos={partidos}
                path={`/fechas/${fecha.id}`}
              />
            );
          })}
        </div>
      ) : (
        <p className="text-neutral-500 text-sm text-center">
          Todavía no hay fixture cargado para esta zona.
        </p>
      )}
    </main>
  );
}

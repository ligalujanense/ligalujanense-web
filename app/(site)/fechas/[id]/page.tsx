import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FechaCard, type PartidoFechaCard } from "@/components/site/FechaCard";

export default async function FechaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: fecha } = await supabase
    .from("fixture_fechas")
    .select(
      `id, numero_fecha, fecha, zonas ( nombre ),
       partidos (
         id, hora, estadio, estado, resultado_local, resultado_visitante,
         equipo_local:equipo_local_id ( clubes ( nombre, logo_url ) ),
         equipo_visitante:equipo_visitante_id ( clubes ( nombre, logo_url ) ),
         libre_equipo:libre_equipo_id ( clubes ( nombre ) )
       )`
    )
    .eq("id", id)
    .single();

  if (!fecha) notFound();

  const zonaNombre = (fecha as any).zonas?.nombre ?? "";
  const fechaFecha: string | null = (fecha as any).fecha ?? null;
  const fechaTexto = fechaFecha
    ? new Date(
        Number(fechaFecha.slice(0, 4)),
        Number(fechaFecha.slice(5, 7)) - 1,
        Number(fechaFecha.slice(8, 10))
      ).toLocaleDateString("es-AR", { weekday: "long", day: "2-digit", month: "long" })
    : null;

  const partidos: PartidoFechaCard[] = ((fecha as any).partidos ?? []).map((partido: any) => ({
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
    <main className="max-w-3xl mx-auto px-4 py-10">
      <FechaCard
        fechaId={id}
        zonaNombre={zonaNombre}
        numeroFecha={fecha.numero_fecha}
        fechaTexto={fechaTexto}
        partidos={partidos}
        path={`/fechas/${id}`}
      />
    </main>
  );
}

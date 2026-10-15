import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FechaCard, type PartidoFechaCard } from "@/components/site/FechaCard";
import { diaLargo } from "@/lib/dias";

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
         id, fecha, hora, estadio, estado, resultado_local, resultado_visitante,
         equipo_local:equipo_local_id ( clubes ( nombre, logo_url ) ),
         equipo_visitante:equipo_visitante_id ( clubes ( nombre, logo_url ) ),
         libre_equipo:libre_equipo_id ( clubes ( nombre ) )
       )`
    )
    .eq("id", id)
    .single();

  if (!fecha) notFound();

  const zonaNombre = (fecha as any).zonas?.nombre ?? "";
  const partidos: PartidoFechaCard[] = [...((fecha as any).partidos ?? [])].sort((a: any, b: any) => (a.fecha ?? "9").localeCompare(b.fecha ?? "9") || (a.hora ?? "").localeCompare(b.hora ?? "")).map((partido: any) => ({
    id: partido.id,
    dia: diaLargo(partido.fecha ?? (fecha as any).fecha),
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
        partidos={partidos}
        path={`/fechas/${id}`}
      />
    </main>
  );
}

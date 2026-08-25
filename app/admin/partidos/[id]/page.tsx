import { notFound, redirect } from "next/navigation";
import { canManageZona } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { PartidoAdminClient } from "./PartidoAdminClient";

export default async function PartidoAdminPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: partido } = await supabase
    .from("partidos")
    .select(
      `id, resultado_local, resultado_visitante,
       fixture_fechas ( zona_id ),
       equipo_local:equipo_local_id ( id, clubes ( nombre ) ),
       equipo_visitante:equipo_visitante_id ( id, clubes ( nombre ) )`
    )
    .eq("id", id)
    .single();

  if (!partido) notFound();

  const zonaId = (partido as any).fixture_fechas?.zona_id;
  if (!zonaId || !(await canManageZona(zonaId))) redirect("/admin");

  const local = {
    id: (partido as any).equipo_local?.id,
    nombre: (partido as any).equipo_local?.clubes?.nombre ?? "Local",
  };
  const visitante = {
    id: (partido as any).equipo_visitante?.id,
    nombre: (partido as any).equipo_visitante?.clubes?.nombre ?? "Visitante",
  };

  const [{ data: goles }, { data: tarjetas }, { data: planillas }] = await Promise.all([
    supabase.from("goles").select("id, equipo_id, jugador, minuto").eq("partido_id", id),
    supabase.from("tarjetas").select("id, equipo_id, jugador, tipo, minuto, motivo").eq("partido_id", id),
    supabase.from("planillas_partido").select("equipo_id, pdf_url, estado").eq("partido_id", id),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">
        {local.nombre} vs {visitante.nombre}
      </h1>
      <PartidoAdminClient
        partidoId={id}
        local={local}
        visitante={visitante}
        resultadoLocal={partido.resultado_local}
        resultadoVisitante={partido.resultado_visitante}
        goles={goles ?? []}
        tarjetas={tarjetas ?? []}
        planillas={planillas ?? []}
      />
    </div>
  );
}

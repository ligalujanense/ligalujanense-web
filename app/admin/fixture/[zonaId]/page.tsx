import { notFound, redirect } from "next/navigation";
import { canManageZona } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { FixtureAdminClient } from "./FixtureAdminClient";

export default async function FixtureZonaAdminPage({
  params,
}: {
  params: Promise<{ zonaId: string }>;
}) {
  const { zonaId } = await params;
  if (!(await canManageZona(zonaId))) redirect("/admin");

  const supabase = createAdminClient();
  const { data: zona } = await supabase
    .from("zonas")
    .select("id, nombre, temporada")
    .eq("id", zonaId)
    .single();
  if (!zona) notFound();

  const [{ data: fechas }, { data: equiposRaw }] = await Promise.all([
    supabase
      .from("fixture_fechas")
      .select(
        "id, numero_fecha, fecha, partidos ( id, equipo_local_id, equipo_visitante_id, libre_equipo_id, hora, estadio, estado, resultado_local, resultado_visitante )"
      )
      .eq("zona_id", zonaId)
      .order("numero_fecha"),
    supabase.from("equipos").select("id, clubes ( nombre )").eq("zona_id", zonaId),
  ]);

  const equipos = (equiposRaw ?? []).map((e: any) => ({
    id: e.id,
    nombre: e.clubes?.nombre ?? "Equipo",
  }));

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold">Fixture — {zona.nombre}</h1>
        <p className="text-neutral-500 text-sm">{zona.temporada}</p>
      </div>
      <FixtureAdminClient zonaId={zonaId} fechas={(fechas as any) ?? []} equipos={equipos} />
    </div>
  );
}

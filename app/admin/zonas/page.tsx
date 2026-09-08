import { createAdminClient } from "@/lib/supabase/admin";
import { CrearZonaForm } from "./CrearZonaForm";
import { ZonaCard } from "./ZonaCard";

export default async function ZonasAdminPage() {
  const supabase = createAdminClient();
  const [{ data: zonas }, { data: clubes }, { data: equiposRaw }] = await Promise.all([
    supabase.from("zonas").select("id, nombre, temporada").order("nombre"),
    supabase.from("clubes").select("id, nombre").order("nombre"),
    supabase
      .from("equipos")
      .select(
        "id, club_id, zona_id, ajuste_pj, ajuste_pg, ajuste_pe, ajuste_pp, ajuste_gf, ajuste_gc, ajuste_pts"
      ),
  ]);

  const equipos = equiposRaw ?? [];
  const todosLosClubes = clubes ?? [];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Zonas y equipos</h1>
      <CrearZonaForm />

      <div className="flex flex-col gap-4">
        {(zonas ?? []).map((zona) => {
          const equiposDeZona = equipos.filter((e) => e.zona_id === zona.id);
          const clubesAsignados = equiposDeZona
            .map((e) => {
              const club = todosLosClubes.find((c) => c.id === e.club_id);
              return club
                ? {
                    equipoId: e.id,
                    clubId: club.id,
                    nombre: club.nombre,
                    ajuste: {
                      pj: e.ajuste_pj ?? 0,
                      pg: e.ajuste_pg ?? 0,
                      pe: e.ajuste_pe ?? 0,
                      pp: e.ajuste_pp ?? 0,
                      gf: e.ajuste_gf ?? 0,
                      gc: e.ajuste_gc ?? 0,
                      pts: e.ajuste_pts ?? 0,
                    },
                  }
                : null;
            })
            .filter(
              (c): c is {
                equipoId: string;
                clubId: string;
                nombre: string;
                ajuste: { pj: number; pg: number; pe: number; pp: number; gf: number; gc: number; pts: number };
              } => c !== null
            );
          const clubesDisponibles = todosLosClubes.filter(
            (c) => !equiposDeZona.some((e) => e.club_id === c.id)
          );

          return (
            <ZonaCard
              key={zona.id}
              zona={zona}
              clubesAsignados={clubesAsignados}
              clubesDisponibles={clubesDisponibles}
            />
          );
        })}
        {(!zonas || zonas.length === 0) && (
          <p className="text-neutral-500 text-sm">No hay zonas cargadas todavía.</p>
        )}
      </div>
    </div>
  );
}

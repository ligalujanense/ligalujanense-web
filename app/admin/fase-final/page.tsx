import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { cargarCuadro } from "@/lib/fase-final-data";
import { normalizar } from "@/lib/goleadores";
import { FaseFinalAdmin } from "./FaseFinalAdmin";

export default async function FaseFinalAdminPage() {
  if (!(await isAdmin())) redirect("/admin");

  const supabase = createAdminClient();
  const { cruces, clubes } = await cargarCuadro(supabase, "futbol-masculino", "2026");

  // Jugadores conocidos (los que ya figuran en las listas de goleadores), una vez por jugador y club.
  const { data: filasGol } = await supabase
    .from("goleadores")
    .select("jugador, club_id")
    .eq("categoria", "futbol-masculino")
    .eq("temporada", "2026");
  const vistos = new Set<string>();
  const pool = (filasGol ?? []).flatMap((f) => {
    if (!f.club_id) return [];
    const clave = `${normalizar(f.jugador)}|${f.club_id}`;
    if (vistos.has(clave)) return [];
    vistos.add(clave);
    return [{ jugador: f.jugador as string, club_id: f.club_id as string }];
  });

  // Goles ya asignados por partido (si la tabla todavía no existe, queda vacío).
  const { data: asig } = await supabase
    .from("fase_final_goles_jugador")
    .select("id, partido_id, jugador, club_id, goles")
    .order("created_at");

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold">Fase final 2026</h1>
        <p className="text-sm text-neutral-500">
          Cargá día, hora, estadio y goles de cada partido. El global, el ganador y el pase a la
          siguiente ronda se calculan solos. Si el global termina empatado, cargá los penales.
        </p>
      </div>
      {cruces.length === 0 ? (
        <p className="text-sm text-neutral-500">Todavía no hay cruces cargados.</p>
      ) : (
        <FaseFinalAdmin cruces={cruces} clubes={clubes} pool={pool} asignaciones={asig ?? []} />
      )}
    </div>
  );
}

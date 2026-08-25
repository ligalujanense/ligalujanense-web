import Link from "next/link";
import { getUsuario } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function FixtureAdminZonasPage() {
  const usuario = await getUsuario();
  const supabase = createAdminClient();

  let query = supabase.from("zonas").select("id, nombre, temporada").order("nombre");
  if (usuario?.rol === "encargado_zona" && usuario.zona_id) {
    query = query.eq("id", usuario.zona_id);
  }
  const { data: zonas } = await query;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Fixture</h1>
      <div className="flex flex-wrap gap-3">
        {(zonas ?? []).map((zona) => (
          <Link
            key={zona.id}
            href={`/admin/fixture/${zona.id}`}
            className="bg-white border border-neutral-200 rounded-lg px-4 py-3 hover:border-dorado transition-colors"
          >
            <p className="font-semibold">{zona.nombre}</p>
            <p className="text-sm text-neutral-500">{zona.temporada}</p>
          </Link>
        ))}
        {(!zonas || zonas.length === 0) && (
          <p className="text-neutral-500 text-sm">No tenés zonas asignadas todavía.</p>
        )}
      </div>
    </div>
  );
}

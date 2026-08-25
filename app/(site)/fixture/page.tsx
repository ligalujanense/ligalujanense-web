import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function FixtureZonasPage() {
  const supabase = await createClient();
  const { data: zonas } = await supabase
    .from("zonas")
    .select("id, nombre, temporada")
    .order("nombre");

  return (
    <main className="max-w-5xl mx-auto px-4 py-10 flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-dorado-oscuro">Fixture</h1>
      <p className="text-neutral-600 text-sm">Elegí una zona para ver su fixture.</p>

      {zonas && zonas.length > 0 ? (
        <div className="flex flex-wrap gap-3">
          {zonas.map((zona) => (
            <Link
              key={zona.id}
              href={`/fixture/${zona.id}`}
              className="border border-neutral-200 rounded-lg px-4 py-3 hover:border-dorado transition-colors"
            >
              <p className="font-semibold">{zona.nombre}</p>
              <p className="text-sm text-neutral-500">{zona.temporada}</p>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-neutral-500 text-sm">Todavía no hay zonas cargadas.</p>
      )}
    </main>
  );
}

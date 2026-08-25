import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function PosicionesZonasPage() {
  const supabase = await createClient();
  const { data: zonas } = await supabase
    .from("zonas")
    .select("id, nombre, temporada")
    .order("nombre");

  return (
    <main className="max-w-5xl mx-auto px-4 py-10 flex flex-col gap-6">
      <div>
        <span className="uppercase tracking-widest text-xs font-bold text-dorado-oscuro">
          Posiciones
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-celeste-oscuro">Elegí una zona</h1>
      </div>

      {zonas && zonas.length > 0 ? (
        <div className="flex flex-wrap gap-3">
          {zonas.map((zona) => (
            <Link
              key={zona.id}
              href={`/posiciones/${zona.id}`}
              className="bg-white border border-neutral-200 rounded-xl px-5 py-4 hover:border-dorado hover:shadow-md transition-all min-w-[160px]"
            >
              <p className="font-bold text-celeste-oscuro">{zona.nombre}</p>
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

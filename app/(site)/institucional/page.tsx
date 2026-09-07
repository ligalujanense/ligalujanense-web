import { createClient } from "@/lib/supabase/server";

export default async function InstitucionalPage() {
  const supabase = await createClient();
  const [{ data: intro }, { data: autoridades }] = await Promise.all([
    supabase.from("institucional").select("contenido").eq("id", "main").single(),
    supabase.from("autoridades").select("id, nombre, cargo").order("orden"),
  ]);

  return (
    <main className="max-w-5xl mx-auto px-4 py-10 flex flex-col gap-14">
      <section className="flex flex-col gap-4">
        <div>
          <span className="uppercase tracking-widest text-xs font-bold text-dorado-oscuro">
            Institucional
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-celeste-oscuro">
            La Liga Lujanense
          </h1>
        </div>
        {intro?.contenido ? (
          <p className="text-neutral-700 leading-relaxed whitespace-pre-line max-w-3xl">
            {intro.contenido}
          </p>
        ) : (
          <p className="text-neutral-500 text-sm">
            Todavía no hay una presentación institucional cargada.
          </p>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl sm:text-2xl font-extrabold text-celeste-oscuro">Autoridades</h2>
        {autoridades && autoridades.length > 0 ? (
          <ul className="flex flex-col divide-y divide-neutral-200 bg-white border border-neutral-200 rounded-xl max-w-2xl">
            {autoridades.map((persona) => (
              <li key={persona.id} className="px-4 py-3">
                <p className="font-semibold text-celeste-oscuro">{persona.nombre}</p>
                <p className="text-sm text-neutral-500">{persona.cargo}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-neutral-500 text-sm">
            Todavía no hay autoridades cargadas.
          </p>
        )}
      </section>
    </main>
  );
}

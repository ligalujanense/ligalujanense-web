import { createClient } from "@/lib/supabase/server";

export default async function InstitucionalPage() {
  const supabase = await createClient();
  const { data: autoridades } = await supabase
    .from("autoridades")
    .select("id, nombre, cargo")
    .order("orden");

  return (
    <main className="max-w-5xl mx-auto px-4 py-10 flex flex-col gap-10">
      <section className="flex flex-col gap-4">
        <div>
          <span className="uppercase tracking-widest text-xs font-bold text-dorado-oscuro">
            Institucional
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-celeste-oscuro">Autoridades</h1>
        </div>
        {autoridades && autoridades.length > 0 ? (
          <ul className="grid sm:grid-cols-2 gap-3">
            {autoridades.map((persona) => (
              <li
                key={persona.id}
                className="bg-white border border-neutral-200 rounded-xl p-4 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-celeste-oscuro flex items-center justify-center text-dorado font-bold text-sm shrink-0">
                  {persona.nombre.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-celeste-oscuro">{persona.nombre}</p>
                  <p className="text-sm text-neutral-500">{persona.cargo}</p>
                </div>
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

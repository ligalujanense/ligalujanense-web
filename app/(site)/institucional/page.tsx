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
        <h1 className="text-2xl font-bold text-dorado-oscuro">Autoridades</h1>
        {autoridades && autoridades.length > 0 ? (
          <ul className="grid sm:grid-cols-2 gap-3">
            {autoridades.map((persona) => (
              <li
                key={persona.id}
                className="border border-neutral-200 rounded-lg p-3"
              >
                <p className="font-semibold">{persona.nombre}</p>
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

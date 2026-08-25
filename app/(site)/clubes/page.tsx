import { createClient } from "@/lib/supabase/server";

export default async function ClubesPage() {
  const supabase = await createClient();
  const { data: clubes } = await supabase
    .from("clubes")
    .select("id, nombre, logo_url, direccion")
    .order("nombre");

  return (
    <main className="max-w-5xl mx-auto px-4 py-10 flex flex-col gap-6">
      <div>
        <span className="uppercase tracking-widest text-xs font-bold text-dorado-oscuro">
          Clubes
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-marino-oscuro">
          Clubes afiliados
        </h1>
      </div>

      {clubes && clubes.length > 0 ? (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {clubes.map((club) => (
            <div
              key={club.id}
              className="bg-white border border-neutral-200 rounded-xl p-5 flex flex-col items-center text-center gap-3 hover:border-dorado hover:shadow-md transition-all"
            >
              {club.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={club.logo_url}
                  alt={club.nombre}
                  className="w-16 h-16 object-contain"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-marino-oscuro flex items-center justify-center text-dorado font-black text-xl">
                  {club.nombre.charAt(0)}
                </div>
              )}
              <div>
                <p className="font-bold text-marino-oscuro">{club.nombre}</p>
                {club.direccion && (
                  <p className="text-sm text-neutral-500">{club.direccion}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-neutral-500 text-sm">Todavía no hay clubes cargados.</p>
      )}
    </main>
  );
}

import { createClient } from "@/lib/supabase/server";

export default async function ClubesPage() {
  const supabase = await createClient();
  const { data: clubes } = await supabase
    .from("clubes")
    .select("id, nombre, logo_url, direccion")
    .order("nombre");

  return (
    <main className="max-w-5xl mx-auto px-4 py-10 flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-dorado-oscuro">Clubes afiliados</h1>

      {clubes && clubes.length > 0 ? (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {clubes.map((club) => (
            <div
              key={club.id}
              className="border border-neutral-200 rounded-lg p-4 flex gap-3 items-center"
            >
              {club.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={club.logo_url}
                  alt={club.nombre}
                  className="w-12 h-12 object-contain"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-dorado/20 flex items-center justify-center text-dorado-oscuro font-bold">
                  {club.nombre.charAt(0)}
                </div>
              )}
              <div>
                <p className="font-semibold">{club.nombre}</p>
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

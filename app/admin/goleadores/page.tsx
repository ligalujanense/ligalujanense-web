import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { hoyArgentina } from "@/lib/match-ticker";
import { rankear } from "@/lib/goleadores";
import { GoleadoresAdmin } from "./GoleadoresAdmin";

export default async function GoleadoresAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ ambito?: string }>;
}) {
  if (!(await isAdmin())) redirect("/admin");
  const { ambito: pedido } = await searchParams;

  const supabase = createAdminClient();
  const { data: zonas } = await supabase
    .from("zonas")
    .select("id, nombre, temporada")
    .eq("categoria", "futbol-masculino")
    .order("temporada", { ascending: false })
    .order("nombre");
  const { data: clubes } = await supabase.from("clubes").select("id, nombre").order("nombre");

  const anio = hoyArgentina().slice(0, 4);
  const ambitos = [
    ...(zonas ?? []).map((z) => ({ id: z.id, etiqueta: `${z.nombre} ${z.temporada}`, temporada: z.temporada })),
    { id: "fase-final", etiqueta: `Fase final ${anio}`, temporada: anio },
  ];
  const actual = ambitos.find((a) => a.id === pedido) ?? ambitos[0];

  let q = supabase
    .from("goleadores")
    .select("id, jugador, club_id, club_nombre, goles")
    .eq("categoria", "futbol-masculino")
    .eq("temporada", actual.temporada);
  q = actual.id === "fase-final" ? q.is("zona_id", null) : q.eq("zona_id", actual.id);
  const { data: filas } = await q;

  const ranking = rankear(filas ?? []);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold">Goleadores</h1>
        <p className="text-sm text-neutral-500">
          Total de goles por jugador. El goleador anual suma las dos zonas y la fase final.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {ambitos.map((a) => (
          <Link
            key={a.id}
            href={`/admin/goleadores?ambito=${a.id}`}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
              a.id === actual.id
                ? "bg-celeste-oscuro text-white"
                : "bg-white border border-neutral-300 text-neutral-600 hover:border-dorado"
            }`}
          >
            {a.etiqueta}
          </Link>
        ))}
      </div>
      <GoleadoresAdmin
        key={actual.id}
        ambito={actual.id}
        temporada={actual.temporada}
        etiqueta={actual.etiqueta}
        filas={ranking}
        clubes={clubes ?? []}
      />
    </div>
  );
}

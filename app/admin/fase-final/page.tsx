import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { cargarCuadro } from "@/lib/fase-final-data";
import { FaseFinalAdmin } from "./FaseFinalAdmin";

export default async function FaseFinalAdminPage() {
  if (!(await isAdmin())) redirect("/admin");

  const { cruces, clubes } = await cargarCuadro(createAdminClient(), "futbol-masculino", "2026");

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
        <FaseFinalAdmin cruces={cruces} clubes={clubes} />
      )}
    </div>
  );
}

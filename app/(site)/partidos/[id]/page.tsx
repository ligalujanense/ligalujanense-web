import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ShareButtons } from "@/components/site/ShareButtons";

export default async function PartidoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: partido } = await supabase
    .from("partidos")
    .select(
      `id, hora, estadio, estado, resultado_local, resultado_visitante,
       fixture_fechas ( numero_fecha, fecha, zonas ( nombre ) ),
       equipo_local:equipo_local_id ( clubes ( nombre, logo_url ) ),
       equipo_visitante:equipo_visitante_id ( clubes ( nombre, logo_url ) )`
    )
    .eq("id", id)
    .single();

  if (!partido) notFound();

  const fechaInfo = (partido as any).fixture_fechas;
  const zonaNombre = fechaInfo?.zonas?.nombre ?? "";
  const numeroFecha = fechaInfo?.numero_fecha;
  const fechaFecha: string | null = fechaInfo?.fecha ?? null;
  const local = (partido as any).equipo_local?.clubes;
  const visitante = (partido as any).equipo_visitante?.clubes;

  const fechaTexto = fechaFecha
    ? new Date(
        Number(fechaFecha.slice(0, 4)),
        Number(fechaFecha.slice(5, 7)) - 1,
        Number(fechaFecha.slice(8, 10))
      ).toLocaleDateString("es-AR", { weekday: "long", day: "2-digit", month: "long" })
    : null;

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 flex flex-col gap-8">
      <div className="flex flex-col items-center gap-1 text-center">
        <span className="uppercase tracking-widest text-xs font-bold text-dorado-oscuro">
          {zonaNombre}
          {numeroFecha ? ` — Fecha ${numeroFecha}` : ""}
        </span>
        {fechaTexto && <span className="text-sm text-neutral-500 capitalize">{fechaTexto}</span>}
      </div>

      <div className="bg-white border border-neutral-200 rounded-2xl p-8 flex flex-col items-center gap-6 shadow-sm">
        <div className="w-full flex items-center justify-center gap-6 sm:gap-10">
          <EquipoBloque nombre={local?.nombre ?? "?"} logoUrl={local?.logo_url ?? null} />

          <div className="flex flex-col items-center gap-1 shrink-0">
            {partido.estado === "jugado" ? (
              <span className="text-3xl sm:text-4xl font-extrabold text-celeste-oscuro">
                {partido.resultado_local} - {partido.resultado_visitante}
              </span>
            ) : (
              <span className="text-2xl sm:text-3xl font-extrabold text-dorado-oscuro">
                {partido.hora ? partido.hora.slice(0, 5) : "A definir"}
              </span>
            )}
            <span className="text-[11px] uppercase tracking-wide text-neutral-400 font-bold">
              {partido.estado === "jugado" ? "Final" : "Programado"}
            </span>
          </div>

          <EquipoBloque nombre={visitante?.nombre ?? "?"} logoUrl={visitante?.logo_url ?? null} />
        </div>

        {partido.estadio && (
          <p className="text-sm text-neutral-500">
            <span className="font-semibold text-neutral-700">Estadio:</span> {partido.estadio}
          </p>
        )}
      </div>

      <div className="flex justify-center">
        <ShareButtons
          title={`${local?.nombre ?? "?"} vs ${visitante?.nombre ?? "?"}`}
          path={`/partidos/${id}`}
        />
      </div>
    </main>
  );
}

function EquipoBloque({ nombre, logoUrl }: { nombre: string; logoUrl: string | null }) {
  return (
    <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logoUrl} alt="" className="w-16 h-16 sm:w-20 sm:h-20 object-contain" />
      ) : (
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-celeste-oscuro/10 text-celeste-oscuro flex items-center justify-center text-2xl font-bold">
          {nombre.charAt(0)}
        </div>
      )}
      <span className="font-bold text-celeste-oscuro text-center text-sm sm:text-base truncate max-w-full">
        {nombre}
      </span>
    </div>
  );
}

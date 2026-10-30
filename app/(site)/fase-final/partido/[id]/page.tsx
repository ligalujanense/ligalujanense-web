import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { cargarPartidoFaseFinal } from "@/lib/fase-final-data";
import { infoPartido } from "@/lib/fase-final";
import { diaLargo } from "@/lib/dias";
import { ShareButtons } from "@/components/site/ShareButtons";
import { Transmision } from "@/components/site/Transmision";
import { estadoTransmision } from "@/lib/transmision";

export default async function PartidoFaseFinalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const datos = await cargarPartidoFaseFinal(supabase, id);
  if (!datos) notFound();

  const { cruce, partido } = datos;
  const i = infoPartido(cruce, partido);
  const dia = diaLargo(partido.fecha);

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 flex flex-col gap-8">
      <div className="flex flex-col items-center gap-1 text-center">
        <span className="uppercase tracking-widest text-xs font-bold text-dorado-oscuro">
          {i.sinFaseFinal ? "" : "Fase final — "}
          {i.ronda}
          {i.tramo ? ` · ${i.tramo}` : ""}
        </span>
        {dia && <span className="text-sm text-neutral-500">{dia}</span>}
      </div>

      <Transmision
        url={partido.transmision_url ?? null}
        estado={estadoTransmision(partido, !!i.marcador)}
        titulo={`${i.local.nombre} vs ${i.visita.nombre}`}
      />

      <div className="bg-white border border-neutral-200 rounded-2xl p-8 flex flex-col items-center gap-6 shadow-sm">
        <div className="w-full flex items-center justify-center gap-6 sm:gap-10">
          <EquipoBloque nombre={i.local.nombre} logoUrl={i.local.club?.logo_url ?? null} />

          <div className="flex flex-col items-center gap-1 shrink-0">
            {i.marcador ? (
              <span className="text-3xl sm:text-4xl font-extrabold text-celeste-oscuro">
                {i.marcador.local} - {i.marcador.visitante}
              </span>
            ) : (
              <span className="text-2xl sm:text-3xl font-extrabold text-dorado-oscuro">
                {partido.hora ? partido.hora.slice(0, 5) : "A definir"}
              </span>
            )}
            <span className="text-[11px] uppercase tracking-wide text-neutral-400 font-bold">
              {i.marcador ? "Final" : "Programado"}
            </span>
            {i.global && (
              <div className="mt-2 flex flex-col items-center">
                <span className="text-[11px] uppercase tracking-widest text-neutral-400 font-bold">
                  Global
                </span>
                <span className="text-xl sm:text-2xl font-extrabold text-dorado-oscuro">
                  {i.global.local} - {i.global.visita}
                </span>
                {i.global.penales && (
                  <span className="text-xs font-semibold text-neutral-500">
                    Penales {i.global.penales.local} - {i.global.penales.visita}
                  </span>
                )}
              </div>
            )}
          </div>

          <EquipoBloque nombre={i.visita.nombre} logoUrl={i.visita.club?.logo_url ?? null} />
        </div>

        {partido.estadio && (
          <p className="text-sm text-neutral-500">
            <span className="font-semibold text-neutral-700">Estadio:</span> {partido.estadio}
          </p>
        )}
      </div>

      <div className="flex flex-col items-center gap-4">
        <ShareButtons
          title={`${i.local.nombre} vs ${i.visita.nombre}`}
          path={`/fase-final/partido/${id}`}
          imagen={{
            endpoint: `/api/fase-final-partido-imagen/${id}`,
            nombreBase: `${i.local.nombre} vs ${i.visita.nombre}`,
          }}
        />
        <Link
          href={`/torneos/${cruce.categoria}/${cruce.temporada}/fase-final`}
          className="text-sm font-semibold text-celeste-oscuro hover:underline"
        >
          Ver cuadro completo →
        </Link>
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

import { ShareButtons } from "@/components/site/ShareButtons";
import { CompartirImagenButton } from "@/components/site/CompartirImagenButton";

export type PartidoFechaCard = {
  id: string;
  hora: string | null;
  estadio: string | null;
  estado: string;
  resultado_local: number | null;
  resultado_visitante: number | null;
  local: { nombre: string; logoUrl: string | null } | null;
  visitante: { nombre: string; logoUrl: string | null } | null;
  libreNombre: string | null;
};

function EquipoBloque({ nombre, logoUrl }: { nombre: string; logoUrl: string | null }) {
  return (
    <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logoUrl} alt="" className="w-14 h-14 sm:w-16 sm:h-16 object-contain" />
      ) : (
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-celeste-oscuro/10 text-celeste-oscuro flex items-center justify-center text-xl font-bold">
          {nombre.charAt(0)}
        </div>
      )}
      <span className="font-bold text-celeste-oscuro text-center text-sm sm:text-base truncate max-w-full">
        {nombre}
      </span>
    </div>
  );
}

export function FechaCard({
  fechaId,
  zonaNombre,
  numeroFecha,
  fechaTexto,
  partidos,
  path,
}: {
  fechaId: string;
  zonaNombre: string;
  numeroFecha: number;
  fechaTexto: string | null;
  partidos: PartidoFechaCard[];
  path: string;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-center gap-1 text-center">
        <span className="uppercase tracking-widest text-xs font-bold text-dorado-oscuro">
          {zonaNombre} — Fecha {numeroFecha}
        </span>
        {fechaTexto && <span className="text-sm text-neutral-500 capitalize">{fechaTexto}</span>}
      </div>

      <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col divide-y divide-neutral-100">
        {partidos.map((partido) => (
          <div key={partido.id} className="flex flex-col items-center gap-3 py-5 first:pt-0 last:pb-0">
            {partido.libreNombre ? (
              <p className="text-neutral-500 text-sm">{partido.libreNombre} — libre</p>
            ) : (
              <>
                <div className="w-full flex items-center justify-center gap-4 sm:gap-8">
                  <EquipoBloque nombre={partido.local?.nombre ?? "?"} logoUrl={partido.local?.logoUrl ?? null} />

                  <div className="flex flex-col items-center gap-1 shrink-0">
                    {partido.estado === "jugado" ? (
                      <span className="text-2xl sm:text-3xl font-extrabold text-celeste-oscuro">
                        {partido.resultado_local} - {partido.resultado_visitante}
                      </span>
                    ) : (
                      <span className="text-xl sm:text-2xl font-extrabold text-dorado-oscuro">
                        {partido.hora ? partido.hora.slice(0, 5) : "A definir"}
                      </span>
                    )}
                    <span className="text-[11px] uppercase tracking-wide text-neutral-400 font-bold">
                      {partido.estado === "jugado" ? "Final" : "Programado"}
                    </span>
                  </div>

                  <EquipoBloque nombre={partido.visitante?.nombre ?? "?"} logoUrl={partido.visitante?.logoUrl ?? null} />
                </div>
                {partido.estadio && (
                  <p className="text-xs sm:text-sm text-neutral-500">
                    <span className="font-semibold text-neutral-700">Estadio:</span> {partido.estadio}
                  </p>
                )}
              </>
            )}
          </div>
        ))}
        {partidos.length === 0 && (
          <p className="text-neutral-400 text-sm text-center py-4">Sin partidos cargados.</p>
        )}
      </div>

      <div className="flex flex-col items-center gap-3">
        <CompartirImagenButton
          endpoint={`/api/fecha-imagen/${fechaId}`}
          titulo={`${zonaNombre} - Fecha ${numeroFecha}`}
          nombreBase={`${zonaNombre} - Fecha ${numeroFecha}`}
        />
        <ShareButtons title={`${zonaNombre} — Fecha ${numeroFecha}`} path={path} />
      </div>
    </div>
  );
}

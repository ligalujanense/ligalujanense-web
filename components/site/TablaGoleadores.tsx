import { formatearNombre } from "@/lib/goleadores";

export type FilaTabla = {
  puesto: number;
  jugador: string;
  club: string;
  logo: string | null;
  /** Para las imágenes de compartir (usan los escudos ya incrustados). */
  clubId?: string | null;
  goles: number;
  regular?: number;
  faseFinal?: number;
};

function Encabezado({ desglose }: { desglose: boolean }) {
  return (
    <thead>
      <tr className="bg-celeste-oscuro text-white text-left">
        <th className="p-3 font-semibold">#</th>
        <th className="p-3 font-semibold">Jugador</th>
        <th className="p-3 font-semibold">Club</th>
        {desglose && <th className="p-3 text-center font-semibold">Zona</th>}
        {desglose && <th className="p-3 text-center font-semibold">Fase final</th>}
        <th className="p-3 text-center font-bold text-dorado">Goles</th>
      </tr>
    </thead>
  );
}

function Fila({ f, desglose }: { f: FilaTabla; desglose: boolean }) {
  const lider = f.puesto === 1;
  return (
    <tr
      className={`border-b border-neutral-100 last:border-0 ${
        lider ? "bg-dorado/10" : "hover:bg-neutral-50"
      }`}
    >
      <td className="p-3">
        <span
          className={`w-6 h-6 inline-flex items-center justify-center rounded-full text-xs font-bold ${
            lider ? "bg-dorado text-celeste-oscuro" : "text-neutral-500"
          }`}
        >
          {f.puesto}
        </span>
      </td>
      <td className="p-3 font-semibold text-celeste-oscuro">{formatearNombre(f.jugador)}</td>
      <td className="p-3 text-neutral-600">
        <div className="flex items-center gap-2">
          {f.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={f.logo} alt="" className="w-5 h-5 object-contain shrink-0" />
          ) : (
            <span className="w-5 h-5 rounded-full bg-celeste-oscuro/10 text-celeste-oscuro flex items-center justify-center text-[10px] font-bold shrink-0">
              {f.club.charAt(0)}
            </span>
          )}
          <span>{f.club}</span>
        </div>
      </td>
      {desglose && <td className="p-3 text-center text-neutral-500">{f.regular ?? 0}</td>}
      {desglose && <td className="p-3 text-center text-neutral-500">{f.faseFinal ?? 0}</td>}
      <td className="p-3 text-center font-extrabold text-celeste-oscuro">{f.goles}</td>
    </tr>
  );
}

/**
 * Tabla de goleadores. Muestra hasta el puesto `hastaPuesto` (los empatados en ese puesto
 * entran todos) y el resto queda en "Ver todos".
 */
export function TablaGoleadores({
  filas,
  hastaPuesto = 10,
  desglose = false,
}: {
  filas: FilaTabla[];
  hastaPuesto?: number;
  desglose?: boolean;
}) {
  const principales = filas.filter((f) => f.puesto <= hastaPuesto);
  const resto = filas.filter((f) => f.puesto > hastaPuesto);

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto rounded-xl border border-neutral-200 shadow-sm">
        <table className="w-full text-sm border-collapse">
          <Encabezado desglose={desglose} />
          <tbody className="bg-white">
            {principales.map((f, i) => (
              <Fila key={`${f.jugador}-${f.club}-${i}`} f={f} desglose={desglose} />
            ))}
          </tbody>
        </table>
      </div>

      {resto.length > 0 && (
        <details className="group">
          <summary className="cursor-pointer text-sm font-semibold text-celeste-oscuro hover:underline">
            Ver todos ({filas.length} jugadores)
          </summary>
          <div className="mt-3 overflow-x-auto rounded-xl border border-neutral-200 shadow-sm">
            <table className="w-full text-sm border-collapse">
              <Encabezado desglose={desglose} />
              <tbody className="bg-white">
                {resto.map((f, i) => (
                  <Fila key={`${f.jugador}-${f.club}-r${i}`} f={f} desglose={desglose} />
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
    </div>
  );
}

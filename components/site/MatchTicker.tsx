import Link from "next/link";
import type { TickerPartido } from "@/lib/match-ticker";

function MatchCard({ partido }: { partido: TickerPartido }) {
  return (
    <div className="shrink-0 min-w-[240px] bg-white rounded-lg px-4 py-3 flex flex-col items-center gap-1.5 shadow-sm">
      <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold">
        {partido.zona}
      </span>
      <div className="flex items-center gap-2 w-full justify-center">
        <span className="text-sm font-semibold text-celeste-oscuro text-right flex-1 truncate">
          {partido.local}
        </span>
        <span
          className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-bold ${
            partido.estado === "jugado"
              ? "bg-celeste-oscuro text-white"
              : "bg-dorado/15 text-dorado-oscuro"
          }`}
        >
          {partido.estado === "jugado"
            ? `${partido.resultado_local} - ${partido.resultado_visitante}`
            : partido.hora ?? "A definir"}
        </span>
        <span className="text-sm font-semibold text-celeste-oscuro flex-1 truncate">
          {partido.visitante}
        </span>
      </div>
    </div>
  );
}

export function MatchTicker({
  partidos,
  modo,
}: {
  partidos: TickerPartido[];
  modo: "jugada" | "proxima";
}) {
  if (partidos.length === 0) return null;

  // Duplicamos la lista para que el loop de la cinta sea continuo (sin salto visible).
  const duracion = Math.max(partidos.length * 3, 18);

  return (
    <section className="bg-celeste-oscuro py-4 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between mb-3">
        <span className="text-white font-bold uppercase text-xs tracking-widest">
          {modo === "jugada" ? "Última fecha jugada" : "Próxima fecha"}
        </span>
        <Link href="/fixture" className="text-dorado-claro text-xs font-bold hover:underline">
          Ver todo el fixture →
        </Link>
      </div>

      <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
        <div
          className="flex gap-3 w-max motion-safe:animate-[marquee_var(--duration)_linear_infinite]"
          style={{ ["--duration" as string]: `${duracion}s` }}
        >
          {[...partidos, ...partidos].map((partido, i) => (
            <MatchCard key={`${partido.id}-${i}`} partido={partido} />
          ))}
        </div>
      </div>
    </section>
  );
}

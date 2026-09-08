import Link from "next/link";
import { tituloTicker, type TickerPartido } from "@/lib/match-ticker";

function formatearFecha(fecha: string | null) {
  if (!fecha) return null;
  // Se parsea manualmente (año-mes-día) para evitar corrimientos de huso horario.
  const [anio, mes, dia] = fecha.split("-").map(Number);
  const date = new Date(anio, mes - 1, dia);
  const texto = date.toLocaleDateString("es-AR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
  return texto.replace(".", "").replace(/^\w/, (c) => c.toUpperCase());
}

function EscudoClub({ nombre, logoUrl }: { nombre: string; logoUrl: string | null }) {
  if (logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={logoUrl} alt="" className="w-7 h-7 object-contain shrink-0" />
    );
  }
  return (
    <span className="w-7 h-7 rounded-full bg-celeste-oscuro/10 text-celeste-oscuro flex items-center justify-center text-[10px] font-bold shrink-0">
      {nombre.charAt(0)}
    </span>
  );
}

function MatchCard({ partido }: { partido: TickerPartido }) {
  const fechaTexto = formatearFecha(partido.fechaFecha);

  return (
    <Link
      href={`/partidos/${partido.id}`}
      className="shrink-0 min-w-[260px] bg-white rounded-lg px-4 py-3 flex flex-col items-center gap-1.5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
    >
      <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold text-center">
        {partido.zona} · Fecha {partido.numeroFecha}
        {fechaTexto ? ` · ${fechaTexto}` : ""}
      </span>
      <div className="flex items-center gap-2 w-full justify-center">
        <span className="flex items-center gap-1.5 flex-1 justify-end min-w-0">
          <span className="text-sm font-semibold text-celeste-oscuro text-right truncate">
            {partido.local}
          </span>
          <EscudoClub nombre={partido.local} logoUrl={partido.logoLocal} />
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
            : partido.hora?.slice(0, 5) ?? "A definir"}
        </span>
        <span className="flex items-center gap-1.5 flex-1 min-w-0">
          <EscudoClub nombre={partido.visitante} logoUrl={partido.logoVisitante} />
          <span className="text-sm font-semibold text-celeste-oscuro truncate">
            {partido.visitante}
          </span>
        </span>
      </div>
    </Link>
  );
}

export function MatchTicker({ partidos }: { partidos: TickerPartido[] }) {
  if (partidos.length === 0) return null;

  // Duplicamos la lista para que el loop de la cinta sea continuo (sin salto visible).
  const duracion = Math.max(partidos.length * 3, 18);

  return (
    <section className="bg-celeste-oscuro py-4 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-[1fr_auto_1fr] items-center mb-3 gap-2">
        <span />
        <span className="text-white font-bold uppercase text-xs tracking-widest text-center">
          {tituloTicker(partidos)}
        </span>
        <Link
          href="/fixture"
          className="text-dorado-claro text-xs font-bold hover:underline justify-self-end"
        >
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

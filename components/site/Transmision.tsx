import { parsearYoutube, urlReproductor, urlVerEnYoutube } from "@/lib/youtube";
import type { EstadoTransmision } from "@/lib/transmision";

const ETIQUETA: Record<EstadoTransmision, string> = {
  envivo: "En vivo",
  proxima: "Próxima transmisión",
  repeticion: "Repetición",
};

/** Reproductor de YouTube del partido. Si el link no es válido, no muestra nada. */
export function Transmision({
  url,
  estado,
  titulo,
}: {
  url: string | null;
  estado: EstadoTransmision;
  titulo: string;
}) {
  const yt = parsearYoutube(url);
  if (!yt) return null;

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        {estado === "envivo" ? (
          <span className="inline-flex items-center gap-2 rounded-full bg-red-600 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-white">
            <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
            {ETIQUETA[estado]}
          </span>
        ) : (
          <span className="rounded-full bg-neutral-200 px-3 py-1 text-xs font-bold uppercase tracking-wider text-neutral-600">
            {ETIQUETA[estado]}
          </span>
        )}
      </div>
      <div className="relative w-full overflow-hidden rounded-2xl bg-black shadow-sm" style={{ aspectRatio: "16 / 9" }}>
        <iframe
          src={urlReproductor(yt)}
          title={`Transmisión: ${titulo}`}
          className="absolute inset-0 h-full w-full"
          loading="lazy"
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
      <a
        href={urlVerEnYoutube(yt)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 self-start rounded-full bg-red-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-red-700"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
          <path d="M8 5v14l11-7z" />
        </svg>
        Ver en YouTube
      </a>
    </section>
  );
}

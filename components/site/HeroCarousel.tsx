"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Noticia = {
  id: string;
  titulo: string;
  slug: string;
  resumen: string | null;
  imagen_url: string | null;
};

export function HeroCarousel({ noticias }: { noticias: Noticia[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (noticias.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const id = setInterval(() => {
      setIndex((i) => (i + 1) % noticias.length);
    }, 6000);
    return () => clearInterval(id);
  }, [noticias.length]);

  const actual = noticias[index];

  return (
    <section className="relative h-[62vh] min-h-[420px] max-h-[640px] overflow-hidden bg-marino-oscuro">
      {noticias.map((noticia, i) => (
        <div
          key={noticia.id}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === index ? 1 : 0 }}
          aria-hidden={i !== index}
        >
          {noticia.imagen_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={noticia.imagen_url}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-dorado-oscuro via-dorado to-celeste-oscuro" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        </div>
      ))}

      <div className="relative h-full max-w-6xl mx-auto px-4 flex flex-col justify-end pb-16 sm:pb-20">
        <div className="max-w-2xl flex flex-col gap-3">
          <span className="text-dorado-claro text-xs font-bold uppercase tracking-[0.18em]">
            Liga Lujanense — Temporada 2026
          </span>
          <h1 className="text-white font-extrabold uppercase text-2xl sm:text-4xl leading-tight text-wrap-balance">
            {actual?.titulo ?? "Liga Lujanense de Fútbol"}
          </h1>
          {actual?.resumen && (
            <p className="text-white/85 max-w-lg text-sm sm:text-base">{actual.resumen}</p>
          )}
          <Link
            href={actual ? `/noticias/${actual.slug}` : "/noticias"}
            className="inline-flex items-center gap-2 self-start bg-white hover:bg-dorado-claro text-marino-oscuro font-bold text-sm px-5 py-2.5 rounded-full transition-colors mt-1"
          >
            Leer más <span aria-hidden>→</span>
          </Link>
        </div>
      </div>

      {noticias.length > 1 && (
        <div className="absolute bottom-5 right-4 sm:right-8 flex gap-2">
          {noticias.map((noticia, i) => (
            <button
              key={noticia.id}
              type="button"
              aria-label={`Ver noticia ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                i === index ? "bg-dorado" : "bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

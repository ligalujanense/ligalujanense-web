"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CATEGORIAS_TORNEO } from "@/lib/torneos";

export function TorneosNavDropdown() {
  const [abierto, setAbierto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickFuera(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setAbierto(false);
      }
    }
    document.addEventListener("click", onClickFuera);
    return () => document.removeEventListener("click", onClickFuera);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setAbierto((v) => !v)}
        className="px-2.5 sm:px-3 py-2 text-[11px] sm:text-xs font-bold uppercase tracking-[0.12em] text-celeste-oscuro/80 hover:text-dorado-oscuro transition-colors"
      >
        Torneos
      </button>
      {abierto && (
        <div className="absolute left-0 top-full mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg py-1 min-w-[200px] z-50">
          {CATEGORIAS_TORNEO.map((cat) => (
            <Link
              key={cat.slug}
              href={`/torneos/${cat.slug}`}
              onClick={() => setAbierto(false)}
              className="block px-4 py-2 text-xs font-semibold text-celeste-oscuro hover:bg-crema hover:text-dorado-oscuro transition-colors"
            >
              {cat.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

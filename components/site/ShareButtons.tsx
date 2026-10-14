"use client";

import { useEffect, useState } from "react";
import { useCompartirImagen, type OpcionesImagen } from "./useCompartirImagen";

const CHIP =
  "px-2 py-1 rounded border border-neutral-300 hover:border-dorado hover:text-dorado-oscuro transition-colors";

type Red = "WhatsApp" | "Instagram" | "Facebook" | "X";

/**
 * Botones para compartir.
 *
 * - Con `imagen`: WhatsApp, Instagram, Facebook y X generan la imagen y la
 *   comparten (en el celular abre el menú del sistema con la imagen adjunta, ahí
 *   se elige la app o la historia/estado; en computadora se descarga). No se
 *   manda el link. Solo "Copiar link" copia el link.
 * - Sin `imagen`: WhatsApp, Facebook y X comparten el link como siempre.
 */
export function ShareButtons({
  title,
  path,
  imagen,
}: {
  title: string;
  path: string;
  imagen?: Omit<OpcionesImagen, "titulo" | "url">;
}) {
  const [origin, setOrigin] = useState("");
  const [copiado, setCopiado] = useState(false);
  const [pulsado, setPulsado] = useState<Red | null>(null);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const url = `${origin}${path}`;

  // Una sola instancia: la imagen se baja una vez aunque haya varios botones.
  const { estado, compartir } = useCompartirImagen(
    { endpoint: imagen?.endpoint ?? "", nombreBase: imagen?.nombreBase ?? "", ...imagen, titulo: title, url: path },
    !!imagen
  );

  const etiqueta = (red: Red) => {
    if (pulsado !== red) return red;
    if (estado === "cargando") return "Generando…";
    if (estado === "error") return "Error, reintentá";
    if (estado === "copiado") return "Link copiado";
    return red;
  };

  const botonImagen = (red: Red) => (
    <button
      key={red}
      type="button"
      disabled={estado === "cargando"}
      onClick={() => {
        setPulsado(red);
        compartir();
      }}
      title={`Compartir la imagen (${red}, historias, estados…)`}
      className={`${CHIP} disabled:opacity-60`}
    >
      {etiqueta(red)}
    </button>
  );

  const enlaces: { label: Red; href: string }[] = [
    { label: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}` },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
    { label: "X", href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}` },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span className="text-neutral-500">Compartir:</span>
      {imagen
        ? (["WhatsApp", "Instagram", "Facebook", "X"] as Red[]).map(botonImagen)
        : enlaces.map((l) => (
            <a
              key={l.label}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className={CHIP}
            >
              {l.label}
            </a>
          ))}
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url);
            setCopiado(true);
            setTimeout(() => setCopiado(false), 2000);
          } catch {
            /* sin permiso de portapapeles: no hacemos nada */
          }
        }}
        className={CHIP}
      >
        {copiado ? "Link copiado" : "Copiar link"}
      </button>
    </div>
  );
}

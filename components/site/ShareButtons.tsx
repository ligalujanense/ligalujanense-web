"use client";

import { useEffect, useState } from "react";
import { useCompartirImagen, type OpcionesImagen } from "./useCompartirImagen";

const CHIP =
  "px-2 py-1 rounded border border-neutral-300 hover:border-dorado hover:text-dorado-oscuro transition-colors";

// Instagram no tiene un link web para compartir como WhatsApp o Facebook: la
// forma de llegar a las historias es el menú de compartir del celular. Este
// botón genera la imagen vertical y abre ese menú (ahí se elige Instagram →
// Historias, o el Estado de WhatsApp). En computadora descarga la imagen.
function BotonInstagram({ opciones }: { opciones: OpcionesImagen }) {
  const { estado, compartir } = useCompartirImagen(opciones);
  return (
    <button
      type="button"
      onClick={compartir}
      disabled={estado === "cargando"}
      title="Compartir en historias de Instagram o estados de WhatsApp"
      className={`${CHIP} disabled:opacity-60`}
    >
      {estado === "cargando"
        ? "Generando…"
        : estado === "error"
          ? "Error, reintentá"
          : estado === "copiado"
            ? "Link copiado"
            : "Instagram"}
    </button>
  );
}

export function ShareButtons({
  title,
  path,
  imagen,
}: {
  title: string;
  path: string;
  /** Si se pasa, se agrega el botón de Instagram (historias) con esta imagen. */
  imagen?: Omit<OpcionesImagen, "titulo" | "url">;
}) {
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const url = `${origin}${path}`;

  const whatsapp = {
    label: "WhatsApp",
    href: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
  };
  const otros = [
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    },
    {
      label: "X",
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    },
  ];

  const enlace = (link: { label: string; href: string }) => (
    <a
      key={link.label}
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      className={CHIP}
    >
      {link.label}
    </a>
  );

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span className="text-neutral-500">Compartir:</span>
      {enlace(whatsapp)}
      {imagen && <BotonInstagram opciones={{ ...imagen, titulo: title, url: path }} />}
      {otros.map(enlace)}
      <button
        type="button"
        onClick={() => navigator.clipboard.writeText(url)}
        className={CHIP}
      >
        Copiar link
      </button>
    </div>
  );
}

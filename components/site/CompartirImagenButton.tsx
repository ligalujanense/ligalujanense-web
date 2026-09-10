"use client";

import { useState } from "react";

/**
 * Genera una imagen (llamando a `endpoint`) y la comparte por el menú nativo del
 * sistema — historia de Instagram, estado de WhatsApp, etc. En escritorio, donde
 * no existe ese menú para archivos, la descarga.
 */
export function CompartirImagenButton({
  endpoint,
  titulo,
  nombreBase,
  cacheBust = true,
}: {
  endpoint: string;
  titulo: string;
  nombreBase: string;
  /** true: pide siempre la imagen fresca (para datos que cambian, ej. fixture).
   *  false: deja que Cloudflare la cachee (para contenido estable, ej. noticias). */
  cacheBust?: boolean;
}) {
  const [estado, setEstado] = useState<"idle" | "cargando" | "error">("idle");

  async function pedirImagen(): Promise<Blob> {
    const url = cacheBust
      ? `${endpoint}${endpoint.includes("?") ? "&" : "?"}t=${Date.now()}`
      : endpoint;
    // El generador de imágenes puede devolver 503 puntualmente por límite de
    // CPU del Worker; se reintenta un par de veces con una pausa corta.
    for (let intento = 0; intento < 3; intento++) {
      const res = await fetch(url);
      if (res.ok) return res.blob();
      if (intento < 2) await new Promise((r) => setTimeout(r, 1600));
    }
    throw new Error("No se pudo generar la imagen");
  }

  async function compartir() {
    setEstado("cargando");
    try {
      const blob = await pedirImagen();
      const nombreArchivo = `${nombreBase.replace(/[^\w\s-]/g, "").trim() || "imagen"}.png`;
      const file = new File([blob], nombreArchivo, { type: "image/png" });

      if (
        typeof navigator.canShare === "function" &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({ files: [file], title: titulo });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = nombreArchivo;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }
      setEstado("idle");
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") {
        setEstado("idle");
        return;
      }
      setEstado("error");
      setTimeout(() => setEstado("idle"), 3000);
    }
  }

  return (
    <button
      type="button"
      onClick={compartir}
      disabled={estado === "cargando"}
      className="inline-flex items-center gap-2 rounded-full bg-celeste-oscuro px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-celeste disabled:opacity-60"
    >
      {estado === "cargando"
        ? "Generando imagen…"
        : estado === "error"
          ? "Error, reintentá"
          : "Compartir imagen"}
    </button>
  );
}

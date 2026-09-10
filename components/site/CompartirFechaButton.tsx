"use client";

import { useState } from "react";

export function CompartirFechaButton({
  fechaId,
  titulo,
}: {
  fechaId: string;
  titulo: string;
}) {
  const [estado, setEstado] = useState<"idle" | "cargando" | "error">("idle");

  async function compartir() {
    setEstado("cargando");
    try {
      const res = await fetch(`/api/fecha-imagen/${fechaId}`);
      if (!res.ok) throw new Error("No se pudo generar la imagen");
      const blob = await res.blob();
      const nombreArchivo = `${titulo.replace(/[^\w\s-]/g, "").trim() || "fecha"}.png`;
      const file = new File([blob], nombreArchivo, { type: "image/png" });

      if (
        typeof navigator.canShare === "function" &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({ files: [file], title: titulo });
      } else {
        // Escritorio: no hay menú de compartir con archivos → se descarga.
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
      // El usuario canceló el menú nativo — no es un error.
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

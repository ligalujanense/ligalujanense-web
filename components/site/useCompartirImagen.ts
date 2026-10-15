"use client";

import { useEffect, useRef, useState } from "react";

export type OpcionesImagen = {
  /** Ruta que genera la imagen (PNG). */
  endpoint: string;
  /** Texto que acompaña al compartir. */
  titulo: string;
  /** Nombre base del archivo descargado/compartido. */
  nombreBase: string;
  /** Link a compartir si no se puede compartir el archivo (ruta o URL). */
  url?: string;
  /** true: agrega ?t=… para saltear toda caché. Por defecto false: las rutas
   *  de imagen ya detectan solas si los datos cambiaron y si no, devuelven la
   *  imagen guardada (generarla de nuevo en cada pedido es caro). */
  cacheBust?: boolean;
  /** Baja la imagen apenas se muestra el botón, así el toque comparte al
   *  instante (los celulares exigen que compartir ocurra dentro del toque). */
  precargar?: boolean;
  /** Si no se puede compartir el archivo: true = se descarga la imagen. */
  descargarEnEscritorio?: boolean;
};

export type EstadoCompartir = "idle" | "cargando" | "error" | "copiado";

/**
 * Genera una imagen y la comparte por el menú nativo del sistema (historia de
 * Instagram, estado de WhatsApp, etc.).
 *
 * Orden de intentos (igual que en deporve-web):
 *   1. Compartir el archivo con el menú nativo (celulares y navegadores que lo permiten).
 *   2. Si no se puede compartir archivos: descargar la imagen (si `descargarEnEscritorio`)
 *      o compartir el link con el menú nativo.
 *   3. Si tampoco hay menú nativo: copiar el link al portapapeles.
 */
export function useCompartirImagen(
  {
    endpoint,
    titulo,
    nombreBase,
    url,
    cacheBust = false,
    precargar = false,
    descargarEnEscritorio = true,
  }: OpcionesImagen,
  /** false: el hook no hace nada (para páginas sin imagen). */
  habilitado = true
) {
  const [estado, setEstado] = useState<EstadoCompartir>("idle");
  const precargada = useRef<Promise<Blob> | null>(null);

  function pedirImagen(): Promise<Blob> {
    const dir = cacheBust
      ? `${endpoint}${endpoint.includes("?") ? "&" : "?"}t=${Date.now()}`
      : endpoint;
    // El generador puede devolver un error puntual: se reintenta un par de veces.
    return (async () => {
      for (let intento = 0; intento < 3; intento++) {
        const res = await fetch(dir);
        if (res.ok) return res.blob();
        if (intento < 2) await new Promise((r) => setTimeout(r, 1600));
      }
      throw new Error("No se pudo generar la imagen");
    })();
  }

  useEffect(() => {
    if (!habilitado || !precargar) return;
    const p = pedirImagen();
    p.catch(() => {
      precargada.current = null;
    });
    precargada.current = p;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, precargar, habilitado]);

  async function compartir() {
    if (!habilitado) return;
    setEstado("cargando");
    try {
      const blob = await (precargada.current ?? pedirImagen());
      const limpio = nombreBase
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^\w\s-]/g, "")
        .trim();
      const nombreArchivo = `${limpio || "imagen"}.png`;
      const file = new File([blob], nombreArchivo, { type: "image/png" });
      const link = url
        ? new URL(url, window.location.origin).toString()
        : window.location.href;

      if (typeof navigator.canShare === "function" && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: titulo });
        setEstado("idle");
        return;
      }

      if (descargarEnEscritorio) {
        const obj = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = obj;
        a.download = nombreArchivo;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(obj);
        setEstado("idle");
        return;
      }

      if (typeof navigator.share === "function") {
        await navigator.share({ title: titulo, url: link });
        setEstado("idle");
        return;
      }

      await navigator.clipboard.writeText(link);
      setEstado("copiado");
      setTimeout(() => setEstado("idle"), 2500);
    } catch (e) {
      // El usuario cerró el menú nativo — no es un error.
      if (e instanceof DOMException && e.name === "AbortError") {
        setEstado("idle");
        return;
      }
      setEstado("error");
      setTimeout(() => setEstado("idle"), 3000);
    }
  }

  return { estado, compartir };
}

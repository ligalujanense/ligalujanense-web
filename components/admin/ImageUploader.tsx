"use client";

import { useState } from "react";
import { subirImagen } from "@/lib/upload-actions";

// Reduce la imagen en el navegador antes de subirla: baja el peso del storage,
// acelera la web y hace que las imágenes de portada entren en el generador de
// imágenes para compartir (next/og no puede procesar archivos muy pesados).
async function redimensionar(file: File, maxLado = 1600): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;

  const { width, height } = bitmap;
  if (Math.max(width, height) <= maxLado) {
    bitmap.close?.();
    return file;
  }

  const escala = maxLado / Math.max(width, height);
  const w = Math.round(width * escala);
  const h = Math.round(height * escala);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close?.();
    return file;
  }
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();

  const tipo = file.type === "image/png" ? "image/png" : "image/jpeg";
  const blob: Blob | null = await new Promise((res) =>
    canvas.toBlob(res, tipo, 0.86)
  );
  if (!blob || blob.size >= file.size) return file;

  const nombre =
    file.name.replace(/\.[^.]+$/, "") + (tipo === "image/png" ? ".png" : ".jpg");
  return new File([blob], nombre, { type: tipo });
}

export function ImageUploader({
  pathPrefix,
  currentUrl,
  onUploaded,
  onUploadingChange,
}: {
  pathPrefix: string;
  currentUrl?: string | null;
  onUploaded: (url: string) => void;
  onUploadingChange?: (uploading: boolean) => void;
}) {
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_MB = 25;
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`La imagen pesa demasiado (máx. ${MAX_MB}MB). Achicala e intentá de nuevo.`);
      e.target.value = "";
      return;
    }

    setUploading(true);
    onUploadingChange?.(true);
    setError(null);

    try {
      const procesada = await redimensionar(file);
      const formData = new FormData();
      formData.set("file", procesada);
      formData.set("pathPrefix", pathPrefix);
      const result = await subirImagen(formData);

      if (result.error || !result.url) {
        setError(result.error ?? "No se pudo subir la imagen.");
        return;
      }

      setPreview(result.url);
      onUploaded(result.url);
    } catch {
      setError("No se pudo subir la imagen. Probá con un archivo más chico.");
    } finally {
      setUploading(false);
      onUploadingChange?.(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      {preview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="" className="w-14 h-14 object-contain border border-neutral-200 rounded" />
      )}
      <div className="flex flex-col gap-1">
        <input type="file" accept="image/*" onChange={handleChange} disabled={uploading} />
        {uploading && <span className="text-xs text-neutral-500">Subiendo...</span>}
        {error && <span className="text-xs text-red-600">{error}</span>}
      </div>
    </div>
  );
}

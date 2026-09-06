"use client";

import { useState } from "react";
import { subirImagen } from "@/lib/upload-actions";

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

    const MAX_MB = 10;
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`La imagen pesa demasiado (máx. ${MAX_MB}MB). Achicala e intentá de nuevo.`);
      e.target.value = "";
      return;
    }

    setUploading(true);
    onUploadingChange?.(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.set("file", file);
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

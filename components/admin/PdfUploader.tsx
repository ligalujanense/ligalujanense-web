"use client";

import { useState, useTransition } from "react";
import { subirDocumento } from "@/lib/upload-actions";

export function PdfUploader({
  path,
  label,
  onUploaded,
}: {
  path: string;
  label: string;
  onUploaded: (path: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_MB = 10;
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`El archivo pesa demasiado (máx. ${MAX_MB}MB).`);
      e.target.value = "";
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("path", path);
      const result = await subirDocumento(formData);

      if (result.error) {
        setError(result.error);
        return;
      }

      startTransition(() => { onUploaded(path); });
    } catch {
      setError("No se pudo subir el archivo. Probá con uno más chico.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <label className="flex flex-col gap-1 text-sm">
      {label}
      <input type="file" accept="application/pdf" onChange={handleChange} disabled={uploading || isPending} />
      {(uploading || isPending) && <span className="text-xs text-neutral-500">Subiendo...</span>}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </label>
  );
}

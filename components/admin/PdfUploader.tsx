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

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.set("file", file);
    formData.set("path", path);
    const result = await subirDocumento(formData);

    setUploading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    startTransition(() => { onUploaded(path); });
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

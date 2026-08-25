"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";

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

    const supabase = createClient();
    const { error: uploadError } = await supabase.storage
      .from("documentos")
      .upload(path, file, { upsert: true });

    setUploading(false);

    if (uploadError) {
      setError("No se pudo subir el archivo.");
      return;
    }

    startTransition(() => onUploaded(path));
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

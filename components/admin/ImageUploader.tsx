"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function ImageUploader({
  pathPrefix,
  currentUrl,
  onUploaded,
}: {
  pathPrefix: string;
  currentUrl?: string | null;
  onUploaded: (url: string) => void;
}) {
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `${pathPrefix}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("imagenes")
      .upload(path, file, { upsert: true });

    setUploading(false);

    if (uploadError) {
      setError("No se pudo subir la imagen.");
      return;
    }

    const { data } = supabase.storage.from("imagenes").getPublicUrl(path);
    setPreview(data.publicUrl);
    onUploaded(data.publicUrl);
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

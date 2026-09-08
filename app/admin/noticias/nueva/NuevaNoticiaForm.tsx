"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { crearNoticia } from "../actions";
import { ImageUploader } from "@/components/admin/ImageUploader";

export function NuevaNoticiaForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [imagenUrl, setImagenUrl] = useState("");
  const [imagenUploading, setImagenUploading] = useState(false);

  return (
    <form
      action={(formData) => {
        formData.set("imagen_url", imagenUrl);
        startTransition(async () => {
          await crearNoticia(formData);
          router.push("/admin/noticias");
        });
      }}
      className="flex flex-col gap-3 bg-white border border-neutral-200 rounded-lg p-4 max-w-xl"
    >
      <label className="flex flex-col gap-1 text-sm">
        Título
        <input name="titulo" required className="border border-neutral-300 rounded px-3 py-2" />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Resumen
        <input name="resumen" className="border border-neutral-300 rounded px-3 py-2" />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Contenido
        <textarea name="contenido" rows={6} className="border border-neutral-300 rounded px-3 py-2" />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Imagen
        <ImageUploader pathPrefix="noticias" onUploaded={setImagenUrl} onUploadingChange={setImagenUploading} />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="publicado" />
        Publicar ahora
      </label>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending || imagenUploading}
          className="bg-dorado hover:bg-dorado-oscuro text-white font-semibold rounded px-4 py-2 disabled:opacity-50"
        >
          {imagenUploading ? "Esperando la imagen..." : "Crear noticia"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/noticias")}
          className="text-neutral-600 text-sm hover:underline px-2"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

"use client";

import { useState, useTransition } from "react";
import { crearNoticia, eliminarNoticia } from "./actions";
import { ImageUploader } from "@/components/admin/ImageUploader";

type Noticia = { id: string; titulo: string; publicado: boolean };

export function NoticiasAdminList({ noticias }: { noticias: Noticia[] }) {
  const [isPending, startTransition] = useTransition();
  const [imagenUrl, setImagenUrl] = useState("");

  return (
    <div className="flex flex-col gap-6">
      <form
        action={(formData) => {
          formData.set("imagen_url", imagenUrl);
          startTransition(() => { crearNoticia(formData); });
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
          <textarea name="contenido" rows={5} className="border border-neutral-300 rounded px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Imagen
          <ImageUploader pathPrefix="noticias" onUploaded={setImagenUrl} />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="publicado" />
          Publicar ahora
        </label>
        <button
          type="submit"
          disabled={isPending}
          className="bg-dorado hover:bg-dorado-oscuro text-white font-semibold rounded px-4 py-2 disabled:opacity-50 self-start"
        >
          Crear noticia
        </button>
      </form>

      <ul className="flex flex-col gap-2">
        {noticias.map((noticia) => (
          <li
            key={noticia.id}
            className="flex items-center justify-between bg-white border border-neutral-200 rounded-lg px-4 py-2"
          >
            <span>
              {noticia.titulo}{" "}
              {!noticia.publicado && (
                <span className="text-xs text-neutral-400">(borrador)</span>
              )}
            </span>
            <button
              onClick={() => startTransition(() => { eliminarNoticia(noticia.id); })}
              className="text-red-600 text-sm hover:underline"
            >
              Eliminar
            </button>
          </li>
        ))}
        {noticias.length === 0 && (
          <p className="text-neutral-500 text-sm">No hay noticias cargadas todavía.</p>
        )}
      </ul>
    </div>
  );
}

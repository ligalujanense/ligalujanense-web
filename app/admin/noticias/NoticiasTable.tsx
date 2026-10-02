"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { actualizarNoticia, alternarPublicado, eliminarNoticia, borrarImagenRedes } from "./actions";
import { ImageUploader } from "@/components/admin/ImageUploader";

type Noticia = {
  id: string;
  slug: string;
  titulo: string;
  resumen: string | null;
  contenido: string | null;
  imagen_url: string | null;
  publicado: boolean;
  created_at: string;
};

export function NoticiasTable({ noticias }: { noticias: Noticia[] }) {
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);

  const fecha = (iso: string) =>
    new Date(iso).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Link
          href="/admin/noticias/nueva"
          className="bg-dorado hover:bg-dorado-oscuro text-white font-semibold rounded px-4 py-2 text-sm"
        >
          + Nueva noticia
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-celeste-oscuro text-white text-left">
              <th className="p-3 font-semibold">Título</th>
              <th className="p-3 font-semibold">Estado</th>
              <th className="p-3 font-semibold">Fecha</th>
              <th className="p-3 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {noticias.map((noticia) =>
              editingId === noticia.id ? (
                <tr key={noticia.id}>
                  <td colSpan={4} className="p-4 bg-neutral-50">
                    <NoticiaEditForm
                      noticia={noticia}
                      onCancel={() => setEditingId(null)}
                      onSaved={() => setEditingId(null)}
                    />
                  </td>
                </tr>
              ) : (
                <tr key={noticia.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                  <td className="p-3 font-semibold text-celeste-oscuro max-w-xs truncate">{noticia.titulo}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        noticia.publicado
                          ? "bg-green-100 text-green-700"
                          : "bg-neutral-200 text-neutral-600"
                      }`}
                    >
                      {noticia.publicado ? "Publicado" : "Borrador"}
                    </span>
                  </td>
                  <td className="p-3 text-neutral-500">{fecha(noticia.created_at)}</td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-3 text-xs font-semibold">
                      <button onClick={() => setEditingId(noticia.id)} className="text-celeste-oscuro hover:underline">
                        Editar
                      </button>
                      {noticia.publicado && <RegenerarImagenRedes slug={noticia.slug} />}
                      <button
                        disabled={isPending}
                        onClick={() =>
                          startTransition(() => {
                            alternarPublicado(noticia.id, !noticia.publicado);
                          })
                        }
                        className="text-dorado-oscuro hover:underline disabled:opacity-50"
                      >
                        {noticia.publicado ? "Despublicar" : "Publicar"}
                      </button>
                      <button
                        disabled={isPending}
                        onClick={() => startTransition(() => { eliminarNoticia(noticia.id); })}
                        className="text-red-600 hover:underline disabled:opacity-50"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              )
            )}
            {noticias.length === 0 && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-neutral-500 text-sm">
                  No hay noticias cargadas todavía.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Borra el collage guardado y lo vuelve a generar desde el navegador (la ruta
// /api/noticia-imagen lo crea y lo guarda de nuevo). Reintenta si el Worker
// devuelve 503 por límite de CPU.
function RegenerarImagenRedes({ slug }: { slug: string }) {
  const [estado, setEstado] = useState<"idle" | "trabajando" | "ok" | "error">("idle");

  async function regenerar() {
    setEstado("trabajando");
    try {
      const borrado = await borrarImagenRedes(slug);
      if (borrado?.error) throw new Error(borrado.error);

      for (let intento = 0; intento < 3; intento++) {
        const res = await fetch(`/api/noticia-imagen/${slug}?t=${Date.now()}`, {
          cache: "no-store",
        });
        if (res.ok) {
          await res.blob();
          setEstado("ok");
          setTimeout(() => setEstado("idle"), 4000);
          return;
        }
        if (intento < 2) await new Promise((r) => setTimeout(r, 1600));
      }
      throw new Error("No se pudo generar");
    } catch {
      setEstado("error");
      setTimeout(() => setEstado("idle"), 4000);
    }
  }

  return (
    <button
      type="button"
      onClick={regenerar}
      disabled={estado === "trabajando"}
      title="Vuelve a generar la imagen que se comparte en historias/estados"
      className="text-celeste-oscuro hover:underline disabled:opacity-50"
    >
      {estado === "trabajando"
        ? "Generando…"
        : estado === "ok"
          ? "✓ Imagen lista"
          : estado === "error"
            ? "Error, reintentá"
            : "Regenerar imagen"}
    </button>
  );
}

function NoticiaEditForm({
  noticia,
  onCancel,
  onSaved,
}: {
  noticia: Noticia;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [imagenUrl, setImagenUrl] = useState(noticia.imagen_url ?? "");
  const [imagenUploading, setImagenUploading] = useState(false);

  return (
    <form
      action={(formData) => {
        formData.set("imagen_url", imagenUrl);
        startTransition(async () => {
          await actualizarNoticia(noticia.id, formData);
          onSaved();
        });
      }}
      className="flex flex-col gap-3 max-w-xl"
    >
      <label className="flex flex-col gap-1 text-sm">
        Título
        <input
          name="titulo"
          required
          defaultValue={noticia.titulo}
          className="border border-neutral-300 rounded px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Resumen
        <input
          name="resumen"
          defaultValue={noticia.resumen ?? ""}
          className="border border-neutral-300 rounded px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Contenido
        <textarea
          name="contenido"
          rows={6}
          defaultValue={noticia.contenido ?? ""}
          className="border border-neutral-300 rounded px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Imagen
        <ImageUploader
          pathPrefix="noticias"
          currentUrl={noticia.imagen_url}
          onUploaded={setImagenUrl}
          onUploadingChange={setImagenUploading}
        />
      </label>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending || imagenUploading}
          className="bg-dorado hover:bg-dorado-oscuro text-white font-semibold rounded px-4 py-2 disabled:opacity-50"
        >
          {imagenUploading ? "Esperando la imagen..." : "Guardar cambios"}
        </button>
        <button type="button" onClick={onCancel} className="text-neutral-600 text-sm hover:underline px-2">
          Cancelar
        </button>
      </div>
    </form>
  );
}

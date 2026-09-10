"use client";

import { useState, useTransition } from "react";
import { crearSponsor, eliminarSponsor, cambiarFilaSponsor } from "./actions";
import { ImageUploader } from "@/components/admin/ImageUploader";

type Sponsor = {
  id: string;
  nombre: string;
  url: string | null;
  logo_url: string | null;
  fila: number | null;
};

export function SponsorsAdminList({ sponsors }: { sponsors: Sponsor[] }) {
  const [isPending, startTransition] = useTransition();
  const [logoUrl, setLogoUrl] = useState("");
  const [logoUploading, setLogoUploading] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <form
        action={(formData) => {
          formData.set("logo_url", logoUrl);
          startTransition(() => { crearSponsor(formData); });
        }}
        className="flex flex-col gap-3 bg-white border border-neutral-200 rounded-lg p-4 max-w-md"
      >
        <label className="flex flex-col gap-1 text-sm">
          Nombre
          <input name="nombre" required className="border border-neutral-300 rounded px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Link (opcional)
          <input name="url" className="border border-neutral-300 rounded px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Fila en el home
          <select name="fila" defaultValue="1" className="border border-neutral-300 rounded px-3 py-2">
            <option value="1">Fila 1 (principal)</option>
            <option value="2">Fila 2 (tamaños dispares)</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Logo
          <ImageUploader pathPrefix="sponsors" onUploaded={setLogoUrl} onUploadingChange={setLogoUploading} />
        </label>
        <button
          type="submit"
          disabled={isPending || logoUploading}
          className="bg-dorado hover:bg-dorado-oscuro text-white font-semibold rounded px-4 py-2 disabled:opacity-50 self-start"
        >
          {logoUploading ? "Esperando el logo..." : "Agregar sponsor"}
        </button>
      </form>

      <ul className="flex flex-col gap-2">
        {sponsors.map((sponsor) => (
          <li
            key={sponsor.id}
            className="flex items-center justify-between gap-3 bg-white border border-neutral-200 rounded-lg px-4 py-2"
          >
            <div className="flex items-center gap-3 min-w-0">
              {sponsor.logo_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={sponsor.logo_url} alt="" className="h-8 w-16 object-contain shrink-0" />
              )}
              <span className="truncate">{sponsor.nombre}</span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <select
                value={sponsor.fila === 2 ? 2 : 1}
                onChange={(e) =>
                  startTransition(() => {
                    cambiarFilaSponsor(sponsor.id, Number(e.target.value));
                  })
                }
                className="border border-neutral-300 rounded px-2 py-1 text-sm"
              >
                <option value={1}>Fila 1</option>
                <option value={2}>Fila 2</option>
              </select>
              <button
                onClick={() => startTransition(() => { eliminarSponsor(sponsor.id); })}
                className="text-red-600 text-sm hover:underline"
              >
                Eliminar
              </button>
            </div>
          </li>
        ))}
        {sponsors.length === 0 && (
          <p className="text-neutral-500 text-sm">No hay sponsors cargados todavía.</p>
        )}
      </ul>
    </div>
  );
}

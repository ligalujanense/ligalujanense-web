"use client";

import { useState, useTransition } from "react";
import { crearSponsor, eliminarSponsor } from "./actions";
import { ImageUploader } from "@/components/admin/ImageUploader";

type Sponsor = { id: string; nombre: string; url: string | null };

export function SponsorsAdminList({ sponsors }: { sponsors: Sponsor[] }) {
  const [isPending, startTransition] = useTransition();
  const [logoUrl, setLogoUrl] = useState("");

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
          Logo
          <ImageUploader pathPrefix="sponsors" onUploaded={setLogoUrl} />
        </label>
        <button
          type="submit"
          disabled={isPending}
          className="bg-dorado hover:bg-dorado-oscuro text-white font-semibold rounded px-4 py-2 disabled:opacity-50 self-start"
        >
          Agregar sponsor
        </button>
      </form>

      <ul className="flex flex-col gap-2">
        {sponsors.map((sponsor) => (
          <li
            key={sponsor.id}
            className="flex items-center justify-between bg-white border border-neutral-200 rounded-lg px-4 py-2"
          >
            <span>{sponsor.nombre}</span>
            <button
              onClick={() => startTransition(() => { eliminarSponsor(sponsor.id); })}
              className="text-red-600 text-sm hover:underline"
            >
              Eliminar
            </button>
          </li>
        ))}
        {sponsors.length === 0 && (
          <p className="text-neutral-500 text-sm">No hay sponsors cargados todavía.</p>
        )}
      </ul>
    </div>
  );
}

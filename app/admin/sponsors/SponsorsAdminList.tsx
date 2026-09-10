"use client";

import { useState, useTransition } from "react";
import {
  crearSponsor,
  eliminarSponsor,
  cambiarFilaSponsor,
  editarSponsor,
  moverSponsor,
} from "./actions";
import { ImageUploader } from "@/components/admin/ImageUploader";

type Sponsor = {
  id: string;
  nombre: string;
  url: string | null;
  logo_url: string | null;
  fila: number | null;
};

function SponsorEditForm({
  sponsor,
  onGuardado,
}: {
  sponsor: Sponsor;
  onGuardado: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [logoUrl, setLogoUrl] = useState("");
  const [logoUploading, setLogoUploading] = useState(false);

  return (
    <form
      action={(formData) => {
        formData.set("logo_url", logoUrl);
        startTransition(() => {
          editarSponsor(sponsor.id, formData);
          onGuardado();
        });
      }}
      className="flex flex-col gap-3 bg-neutral-50 border border-neutral-100 rounded p-3 text-sm"
    >
      <label className="flex flex-col gap-1">
        Nombre
        <input
          name="nombre"
          required
          defaultValue={sponsor.nombre}
          className="border border-neutral-300 rounded px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1">
        Link (opcional)
        <input
          name="url"
          defaultValue={sponsor.url ?? ""}
          className="border border-neutral-300 rounded px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1">
        Fila en el home
        <select
          name="fila"
          defaultValue={sponsor.fila === 2 ? "2" : "1"}
          className="border border-neutral-300 rounded px-3 py-2"
        >
          <option value="1">Fila 1 (principal)</option>
          <option value="2">Fila 2 (tamaños dispares)</option>
        </select>
      </label>
      <label className="flex flex-col gap-1">
        Reemplazar logo (opcional)
        <ImageUploader
          pathPrefix="sponsors"
          onUploaded={setLogoUrl}
          onUploadingChange={setLogoUploading}
        />
        <span className="text-xs text-neutral-500">
          Si no subís uno nuevo, se mantiene el logo actual.
        </span>
      </label>
      <button
        type="submit"
        disabled={isPending || logoUploading}
        className="bg-celeste-oscuro hover:bg-celeste text-white font-semibold rounded px-4 py-2 disabled:opacity-50 self-start"
      >
        {logoUploading ? "Esperando el logo..." : "Guardar cambios"}
      </button>
    </form>
  );
}

export function SponsorsAdminList({ sponsors }: { sponsors: Sponsor[] }) {
  const [isPending, startTransition] = useTransition();
  const [logoUrl, setLogoUrl] = useState("");
  const [logoUploading, setLogoUploading] = useState(false);
  const [editando, setEditando] = useState<string | null>(null);

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
        {sponsors.map((sponsor, i) => {
          const mismoFilaArriba = sponsors.slice(0, i).some(
            (s) => (s.fila ?? 1) === (sponsor.fila ?? 1)
          );
          const mismoFilaAbajo = sponsors.slice(i + 1).some(
            (s) => (s.fila ?? 1) === (sponsor.fila ?? 1)
          );
          return (
          <li
            key={sponsor.id}
            className="flex flex-col gap-3 bg-white border border-neutral-200 rounded-lg px-4 py-2"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex flex-col shrink-0">
                  <button
                    onClick={() => startTransition(() => { moverSponsor(sponsor.id, "arriba"); })}
                    disabled={!mismoFilaArriba}
                    className="text-neutral-500 hover:text-celeste-oscuro disabled:opacity-20 text-xs leading-none"
                    aria-label="Subir"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => startTransition(() => { moverSponsor(sponsor.id, "abajo"); })}
                    disabled={!mismoFilaAbajo}
                    className="text-neutral-500 hover:text-celeste-oscuro disabled:opacity-20 text-xs leading-none"
                    aria-label="Bajar"
                  >
                    ▼
                  </button>
                </div>
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
                  onClick={() => setEditando(editando === sponsor.id ? null : sponsor.id)}
                  className="text-celeste-oscuro text-sm hover:underline"
                >
                  {editando === sponsor.id ? "Cerrar" : "Editar"}
                </button>
                <button
                  onClick={() => startTransition(() => { eliminarSponsor(sponsor.id); })}
                  className="text-red-600 text-sm hover:underline"
                >
                  Eliminar
                </button>
              </div>
            </div>
            {editando === sponsor.id && (
              <SponsorEditForm sponsor={sponsor} onGuardado={() => setEditando(null)} />
            )}
          </li>
          );
        })}
        {sponsors.length === 0 && (
          <p className="text-neutral-500 text-sm">No hay sponsors cargados todavía.</p>
        )}
      </ul>
    </div>
  );
}

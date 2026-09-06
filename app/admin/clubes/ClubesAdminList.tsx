"use client";

import { useState, useTransition } from "react";
import { crearClub, actualizarClub, eliminarClub } from "./actions";
import { ImageUploader } from "@/components/admin/ImageUploader";

type Club = {
  id: string;
  nombre: string;
  direccion: string | null;
  contacto: string | null;
  logo_url: string | null;
};

export function ClubesAdminList({ clubes }: { clubes: Club[] }) {
  const [isPending, startTransition] = useTransition();
  const [logoUrl, setLogoUrl] = useState("");
  const [logoUploading, setLogoUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-6">
      <form
        action={(formData) => {
          formData.set("logo_url", logoUrl);
          startTransition(() => { crearClub(formData); });
        }}
        className="flex flex-col gap-3 bg-white border border-neutral-200 rounded-lg p-4 max-w-md"
      >
        <label className="flex flex-col gap-1 text-sm">
          Nombre
          <input name="nombre" required className="border border-neutral-300 rounded px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Dirección
          <input name="direccion" className="border border-neutral-300 rounded px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Contacto
          <input name="contacto" className="border border-neutral-300 rounded px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Logo
          <ImageUploader pathPrefix="clubes" onUploaded={setLogoUrl} onUploadingChange={setLogoUploading} />
        </label>
        <button
          type="submit"
          disabled={isPending || logoUploading}
          className="bg-dorado hover:bg-dorado-oscuro text-white font-semibold rounded px-4 py-2 disabled:opacity-50 self-start"
        >
          {logoUploading ? "Esperando el logo..." : "Agregar club"}
        </button>
      </form>

      <ul className="flex flex-col gap-2">
        {clubes.map((club) =>
          editingId === club.id ? (
            <ClubEditForm
              key={club.id}
              club={club}
              onCancel={() => setEditingId(null)}
              onSaved={() => setEditingId(null)}
            />
          ) : (
            <li
              key={club.id}
              className="flex items-center justify-between bg-white border border-neutral-200 rounded-lg px-4 py-2"
            >
              <span className="flex items-center gap-3">
                {club.logo_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={club.logo_url} alt="" className="w-8 h-8 object-contain" />
                )}
                <strong>{club.nombre}</strong>
                {club.direccion && <span className="text-neutral-500 text-sm">— {club.direccion}</span>}
              </span>
              <span className="flex items-center gap-3">
                <button
                  onClick={() => setEditingId(club.id)}
                  className="text-celeste-oscuro text-sm hover:underline"
                >
                  Editar
                </button>
                <button
                  onClick={() => startTransition(() => { eliminarClub(club.id); })}
                  className="text-red-600 text-sm hover:underline"
                >
                  Eliminar
                </button>
              </span>
            </li>
          )
        )}
        {clubes.length === 0 && (
          <p className="text-neutral-500 text-sm">No hay clubes cargados todavía.</p>
        )}
      </ul>
    </div>
  );
}

function ClubEditForm({
  club,
  onCancel,
  onSaved,
}: {
  club: Club;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [logoUrl, setLogoUrl] = useState(club.logo_url ?? "");
  const [logoUploading, setLogoUploading] = useState(false);

  return (
    <li className="bg-white border border-celeste-oscuro rounded-lg p-4">
      <form
        action={(formData) => {
          formData.set("logo_url", logoUrl);
          startTransition(async () => {
            await actualizarClub(club.id, formData);
            onSaved();
          });
        }}
        className="flex flex-col gap-3 max-w-md"
      >
        <label className="flex flex-col gap-1 text-sm">
          Nombre
          <input
            name="nombre"
            required
            defaultValue={club.nombre}
            className="border border-neutral-300 rounded px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Dirección
          <input
            name="direccion"
            defaultValue={club.direccion ?? ""}
            className="border border-neutral-300 rounded px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Contacto
          <input
            name="contacto"
            defaultValue={club.contacto ?? ""}
            className="border border-neutral-300 rounded px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Logo
          <ImageUploader
            pathPrefix="clubes"
            currentUrl={club.logo_url}
            onUploaded={setLogoUrl}
            onUploadingChange={setLogoUploading}
          />
        </label>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isPending || logoUploading}
            className="bg-dorado hover:bg-dorado-oscuro text-white font-semibold rounded px-4 py-2 disabled:opacity-50"
          >
            {logoUploading ? "Esperando el logo..." : "Guardar cambios"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="text-neutral-600 text-sm hover:underline px-2"
          >
            Cancelar
          </button>
        </div>
      </form>
    </li>
  );
}

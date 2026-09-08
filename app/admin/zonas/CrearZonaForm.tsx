"use client";

import { useTransition } from "react";
import { crearZona } from "./actions";

export function CrearZonaForm() {
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => startTransition(() => { crearZona(formData); })}
      className="flex flex-wrap items-end gap-3 bg-white border border-neutral-200 rounded-lg p-4"
    >
      <label className="flex flex-col gap-1 text-sm">
        Nombre
        <input name="nombre" required placeholder="Zona Sur" className="border border-neutral-300 rounded px-3 py-2" />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Temporada
        <input name="temporada" required placeholder="2026" className="border border-neutral-300 rounded px-3 py-2" />
      </label>
      <button
        type="submit"
        disabled={isPending}
        className="bg-dorado hover:bg-dorado-oscuro text-white font-semibold rounded px-4 py-2 disabled:opacity-50"
      >
        Agregar zona
      </button>
    </form>
  );
}

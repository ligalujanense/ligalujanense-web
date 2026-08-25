"use client";

import { useTransition } from "react";
import { crearAutoridad, eliminarAutoridad } from "./actions";

type Autoridad = { id: string; nombre: string; cargo: string };

export function AutoridadesAdminList({ autoridades }: { autoridades: Autoridad[] }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-6">
      <form
        action={(formData) => startTransition(() => { crearAutoridad(formData); })}
        className="flex flex-wrap items-end gap-3 bg-white border border-neutral-200 rounded-lg p-4"
      >
        <label className="flex flex-col gap-1 text-sm">
          Nombre
          <input name="nombre" required className="border border-neutral-300 rounded px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Cargo
          <input name="cargo" required placeholder="Presidente" className="border border-neutral-300 rounded px-3 py-2" />
        </label>
        <button
          type="submit"
          disabled={isPending}
          className="bg-dorado hover:bg-dorado-oscuro text-white font-semibold rounded px-4 py-2 disabled:opacity-50"
        >
          Agregar
        </button>
      </form>

      <ul className="flex flex-col gap-2">
        {autoridades.map((persona) => (
          <li
            key={persona.id}
            className="flex items-center justify-between bg-white border border-neutral-200 rounded-lg px-4 py-2"
          >
            <span>
              <strong>{persona.nombre}</strong> — {persona.cargo}
            </span>
            <button
              onClick={() => startTransition(() => { eliminarAutoridad(persona.id); })}
              className="text-red-600 text-sm hover:underline"
            >
              Eliminar
            </button>
          </li>
        ))}
        {autoridades.length === 0 && (
          <p className="text-neutral-500 text-sm">No hay autoridades cargadas todavía.</p>
        )}
      </ul>
    </div>
  );
}

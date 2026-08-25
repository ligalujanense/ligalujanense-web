"use client";

import { useTransition } from "react";
import { crearZona, eliminarZona } from "./actions";

type Zona = { id: string; nombre: string; temporada: string };

export function ZonasAdminList({ zonas }: { zonas: Zona[] }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-6">
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

      <ul className="flex flex-col gap-2">
        {zonas.map((zona) => (
          <li
            key={zona.id}
            className="flex items-center justify-between bg-white border border-neutral-200 rounded-lg px-4 py-2"
          >
            <span>
              <strong>{zona.nombre}</strong> — {zona.temporada}
            </span>
            <button
              onClick={() => startTransition(() => { eliminarZona(zona.id); })}
              className="text-red-600 text-sm hover:underline"
            >
              Eliminar
            </button>
          </li>
        ))}
        {zonas.length === 0 && (
          <p className="text-neutral-500 text-sm">No hay zonas cargadas todavía.</p>
        )}
      </ul>
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import {
  crearAutoridad,
  eliminarAutoridad,
  editarAutoridad,
  moverAutoridad,
} from "./actions";

type Autoridad = { id: string; nombre: string; cargo: string };

function AutoridadEditForm({
  persona,
  onGuardado,
}: {
  persona: Autoridad;
  onGuardado: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={(formData) =>
        startTransition(() => {
          editarAutoridad(persona.id, formData);
          onGuardado();
        })
      }
      className="flex flex-wrap items-end gap-3 bg-neutral-50 border border-neutral-100 rounded p-3 text-sm"
    >
      <label className="flex flex-col gap-1">
        Nombre
        <input
          name="nombre"
          required
          defaultValue={persona.nombre}
          className="border border-neutral-300 rounded px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1">
        Cargo
        <input
          name="cargo"
          required
          defaultValue={persona.cargo}
          className="border border-neutral-300 rounded px-3 py-2"
        />
      </label>
      <button
        type="submit"
        disabled={isPending}
        className="bg-celeste-oscuro hover:bg-celeste text-white font-semibold rounded px-4 py-2 disabled:opacity-50"
      >
        Guardar cambios
      </button>
    </form>
  );
}

export function AutoridadesAdminList({ autoridades }: { autoridades: Autoridad[] }) {
  const [isPending, startTransition] = useTransition();
  const [editando, setEditando] = useState<string | null>(null);

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
        {autoridades.map((persona, i) => (
          <li
            key={persona.id}
            className="flex flex-col gap-3 bg-white border border-neutral-200 rounded-lg px-4 py-2"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex flex-col shrink-0">
                  <button
                    onClick={() => startTransition(() => { moverAutoridad(persona.id, "arriba"); })}
                    disabled={i === 0}
                    className="text-neutral-500 hover:text-celeste-oscuro disabled:opacity-20 text-xs leading-none"
                    aria-label="Subir"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => startTransition(() => { moverAutoridad(persona.id, "abajo"); })}
                    disabled={i === autoridades.length - 1}
                    className="text-neutral-500 hover:text-celeste-oscuro disabled:opacity-20 text-xs leading-none"
                    aria-label="Bajar"
                  >
                    ▼
                  </button>
                </div>
                <span className="truncate">
                  <strong>{persona.nombre}</strong> — {persona.cargo}
                </span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => setEditando(editando === persona.id ? null : persona.id)}
                  className="text-celeste-oscuro text-sm hover:underline"
                >
                  {editando === persona.id ? "Cerrar" : "Editar"}
                </button>
                <button
                  onClick={() => startTransition(() => { eliminarAutoridad(persona.id); })}
                  className="text-red-600 text-sm hover:underline"
                >
                  Eliminar
                </button>
              </div>
            </div>
            {editando === persona.id && (
              <AutoridadEditForm persona={persona} onGuardado={() => setEditando(null)} />
            )}
          </li>
        ))}
        {autoridades.length === 0 && (
          <p className="text-neutral-500 text-sm">No hay autoridades cargadas todavía.</p>
        )}
      </ul>
    </div>
  );
}

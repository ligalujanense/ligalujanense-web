"use client";

import { useTransition } from "react";
import { crearEquipo, eliminarEquipo } from "./actions";

type Club = { id: string; nombre: string };
type Zona = { id: string; nombre: string };
type Equipo = { id: string; club_id: string; zona_id: string };

export function EquiposAdminList({
  equipos,
  clubes,
  zonas,
}: {
  equipos: Equipo[];
  clubes: Club[];
  zonas: Zona[];
}) {
  const [isPending, startTransition] = useTransition();

  const nombreClub = (id: string) => clubes.find((c) => c.id === id)?.nombre ?? "?";
  const nombreZona = (id: string) => zonas.find((z) => z.id === id)?.nombre ?? "?";

  return (
    <div className="flex flex-col gap-6">
      <form
        action={(formData) => startTransition(() => { crearEquipo(formData); })}
        className="flex flex-wrap items-end gap-3 bg-white border border-neutral-200 rounded-lg p-4"
      >
        <label className="flex flex-col gap-1 text-sm">
          Club
          <select name="club_id" required className="border border-neutral-300 rounded px-3 py-2">
            <option value="">Elegir club</option>
            {clubes.map((club) => (
              <option key={club.id} value={club.id}>
                {club.nombre}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Zona
          <select name="zona_id" required className="border border-neutral-300 rounded px-3 py-2">
            <option value="">Elegir zona</option>
            {zonas.map((zona) => (
              <option key={zona.id} value={zona.id}>
                {zona.nombre}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          disabled={isPending}
          className="bg-dorado hover:bg-dorado-oscuro text-white font-semibold rounded px-4 py-2 disabled:opacity-50"
        >
          Asignar equipo a zona
        </button>
      </form>

      <ul className="flex flex-col gap-2">
        {equipos.map((equipo) => (
          <li
            key={equipo.id}
            className="flex items-center justify-between bg-white border border-neutral-200 rounded-lg px-4 py-2"
          >
            <span>
              <strong>{nombreClub(equipo.club_id)}</strong> — {nombreZona(equipo.zona_id)}
            </span>
            <button
              onClick={() => startTransition(() => { eliminarEquipo(equipo.id); })}
              className="text-red-600 text-sm hover:underline"
            >
              Quitar
            </button>
          </li>
        ))}
        {equipos.length === 0 && (
          <p className="text-neutral-500 text-sm">No hay equipos asignados todavía.</p>
        )}
      </ul>
    </div>
  );
}

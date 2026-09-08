"use client";

import { useTransition } from "react";
import { eliminarZona, crearEquipo, eliminarEquipo } from "./actions";

type Zona = { id: string; nombre: string; temporada: string };
type ClubAsignado = { equipoId: string; clubId: string; nombre: string };
type Club = { id: string; nombre: string };

export function ZonaCard({
  zona,
  clubesAsignados,
  clubesDisponibles,
}: {
  zona: Zona;
  clubesAsignados: ClubAsignado[];
  clubesDisponibles: Club[];
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <section className="bg-white border border-neutral-200 rounded-lg p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-celeste-oscuro">{zona.nombre}</h2>
          <p className="text-sm text-neutral-500">{zona.temporada}</p>
        </div>
        <button
          onClick={() => startTransition(() => { eliminarZona(zona.id); })}
          className="text-red-600 text-sm hover:underline"
        >
          Eliminar zona
        </button>
      </div>

      <ul className="flex flex-col gap-1">
        {clubesAsignados.map((club) => (
          <li
            key={club.equipoId}
            className="flex items-center justify-between text-sm border border-neutral-100 rounded px-3 py-1.5"
          >
            <span>{club.nombre}</span>
            <button
              onClick={() => startTransition(() => { eliminarEquipo(club.equipoId); })}
              className="text-red-600 text-xs hover:underline"
            >
              Quitar
            </button>
          </li>
        ))}
        {clubesAsignados.length === 0 && (
          <p className="text-neutral-400 text-sm">Sin clubes asignados todavía.</p>
        )}
      </ul>

      {clubesDisponibles.length > 0 && (
        <form
          action={(formData) => startTransition(() => { crearEquipo(formData); })}
          className="flex flex-wrap items-end gap-2 text-sm border-t border-neutral-100 pt-3"
        >
          <input type="hidden" name="zona_id" value={zona.id} />
          <label className="flex flex-col gap-1">
            Agregar club
            <select name="club_id" required className="border border-neutral-300 rounded px-2 py-1.5">
              <option value="">Elegir club</option>
              {clubesDisponibles.map((club) => (
                <option key={club.id} value={club.id}>
                  {club.nombre}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            disabled={isPending}
            className="bg-dorado hover:bg-dorado-oscuro text-white rounded px-3 py-1.5 disabled:opacity-50"
          >
            Agregar
          </button>
        </form>
      )}
    </section>
  );
}

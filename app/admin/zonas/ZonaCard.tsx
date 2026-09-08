"use client";

import { useState, useTransition } from "react";
import { eliminarZona, crearEquipo, eliminarEquipo, actualizarAjusteInicial } from "./actions";

type Zona = { id: string; nombre: string; temporada: string };
type Ajuste = { pj: number; pg: number; pe: number; pp: number; gf: number; gc: number; pts: number };
type ClubAsignado = { equipoId: string; clubId: string; nombre: string; ajuste: Ajuste };
type Club = { id: string; nombre: string };

const CAMPOS_AJUSTE: { key: keyof Ajuste; label: string }[] = [
  { key: "pj", label: "PJ" },
  { key: "pg", label: "PG" },
  { key: "pe", label: "PE" },
  { key: "pp", label: "PP" },
  { key: "gf", label: "GF" },
  { key: "gc", label: "GC" },
  { key: "pts", label: "Pts" },
];

function AjusteInicialForm({ equipoId, ajuste }: { equipoId: string; ajuste: Ajuste }) {
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={(formData) =>
        startTransition(() => {
          actualizarAjusteInicial(equipoId, formData);
        })
      }
      className="flex flex-wrap items-end gap-2 text-xs bg-neutral-50 border border-neutral-100 rounded px-3 py-2"
    >
      {CAMPOS_AJUSTE.map((campo) => (
        <label key={campo.key} className="flex flex-col gap-0.5">
          {campo.label}
          <input
            type="number"
            name={`ajuste_${campo.key}`}
            defaultValue={ajuste[campo.key]}
            className="border border-neutral-300 rounded px-1.5 py-1 w-14 text-center"
          />
        </label>
      ))}
      <button
        type="submit"
        disabled={isPending}
        className="bg-celeste-oscuro hover:bg-celeste text-white rounded px-2.5 py-1.5 disabled:opacity-50"
      >
        Guardar ajuste
      </button>
    </form>
  );
}

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
  const [equipoAbierto, setEquipoAbierto] = useState<string | null>(null);

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
            className="flex flex-col gap-2 text-sm border border-neutral-100 rounded px-3 py-1.5"
          >
            <div className="flex items-center justify-between">
              <span>{club.nombre}</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() =>
                    setEquipoAbierto(equipoAbierto === club.equipoId ? null : club.equipoId)
                  }
                  className="text-celeste-oscuro text-xs hover:underline"
                >
                  {equipoAbierto === club.equipoId ? "Cerrar ajuste" : "Ajuste inicial"}
                </button>
                <button
                  onClick={() => startTransition(() => { eliminarEquipo(club.equipoId); })}
                  className="text-red-600 text-xs hover:underline"
                >
                  Quitar
                </button>
              </div>
            </div>
            {equipoAbierto === club.equipoId && (
              <AjusteInicialForm equipoId={club.equipoId} ajuste={club.ajuste} />
            )}
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

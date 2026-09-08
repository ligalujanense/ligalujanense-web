"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { crearFecha, crearPartido, editarPartido, eliminarFecha, eliminarPartido } from "./actions";

type Equipo = { id: string; nombre: string };
type Partido = {
  id: string;
  equipo_local_id: string | null;
  equipo_visitante_id: string | null;
  libre_equipo_id: string | null;
  hora: string | null;
  estadio: string | null;
  estado: string;
  resultado_local: number | null;
  resultado_visitante: number | null;
};
type Fecha = { id: string; numero_fecha: number; fecha: string | null; partidos: Partido[] };

function EditarPartidoForm({
  zonaId,
  partido,
  equipos,
  onGuardado,
}: {
  zonaId: string;
  partido: Partido;
  equipos: Equipo[];
  onGuardado: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={(formData) =>
        startTransition(() => {
          editarPartido(zonaId, partido.id, formData);
          onGuardado();
        })
      }
      className="flex flex-wrap items-end gap-2 text-sm bg-neutral-50 border border-neutral-100 rounded px-3 py-2"
    >
      <label className="flex flex-col gap-1">
        Local
        <select
          name="equipo_local_id"
          defaultValue={partido.equipo_local_id ?? ""}
          className="border border-neutral-300 rounded px-2 py-1"
        >
          <option value="">—</option>
          {equipos.map((e) => (
            <option key={e.id} value={e.id}>{e.nombre}</option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1">
        Visitante
        <select
          name="equipo_visitante_id"
          defaultValue={partido.equipo_visitante_id ?? ""}
          className="border border-neutral-300 rounded px-2 py-1"
        >
          <option value="">—</option>
          {equipos.map((e) => (
            <option key={e.id} value={e.id}>{e.nombre}</option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1">
        Hora
        <input
          type="time"
          name="hora"
          defaultValue={partido.hora ? partido.hora.slice(0, 5) : ""}
          className="border border-neutral-300 rounded px-2 py-1"
        />
      </label>
      <label className="flex flex-col gap-1">
        Estadio
        <input
          name="estadio"
          defaultValue={partido.estadio ?? ""}
          className="border border-neutral-300 rounded px-2 py-1"
        />
      </label>
      <label className="flex flex-col gap-1">
        O libre
        <select
          name="libre_equipo_id"
          defaultValue={partido.libre_equipo_id ?? ""}
          className="border border-neutral-300 rounded px-2 py-1"
        >
          <option value="">—</option>
          {equipos.map((e) => (
            <option key={e.id} value={e.id}>{e.nombre}</option>
          ))}
        </select>
      </label>
      <button
        type="submit"
        disabled={isPending}
        className="bg-celeste-oscuro hover:bg-celeste text-white rounded px-3 py-1.5 disabled:opacity-50"
      >
        Guardar
      </button>
    </form>
  );
}

export function FixtureAdminClient({
  zonaId,
  fechas,
  equipos,
}: {
  zonaId: string;
  fechas: Fecha[];
  equipos: Equipo[];
}) {
  const [isPending, startTransition] = useTransition();
  const [partidoEditando, setPartidoEditando] = useState<string | null>(null);
  const nombreEquipo = (id: string | null) =>
    equipos.find((e) => e.id === id)?.nombre ?? "?";

  return (
    <div className="flex flex-col gap-8">
      <form
        action={(formData) => startTransition(() => { crearFecha(zonaId, formData); })}
        className="flex flex-wrap items-end gap-3 bg-white border border-neutral-200 rounded-lg p-4"
      >
        <label className="flex flex-col gap-1 text-sm">
          N° de fecha
          <input
            type="number"
            name="numero_fecha"
            required
            min={1}
            className="border border-neutral-300 rounded px-3 py-2 w-24"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Fecha (opcional)
          <input type="date" name="fecha" className="border border-neutral-300 rounded px-3 py-2" />
        </label>
        <button
          type="submit"
          disabled={isPending}
          className="bg-dorado hover:bg-dorado-oscuro text-white font-semibold rounded px-4 py-2 disabled:opacity-50"
        >
          Agregar fecha
        </button>
      </form>

      <div className="flex flex-col gap-6">
        {fechas.map((fecha) => (
          <section key={fecha.id} className="bg-white border border-neutral-200 rounded-lg p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">
                Fecha {fecha.numero_fecha}
                {fecha.fecha ? ` — ${fecha.fecha}` : ""}
              </h2>
              <button
                onClick={() => startTransition(() => { eliminarFecha(zonaId, fecha.id); })}
                className="text-red-600 text-sm hover:underline"
              >
                Eliminar fecha
              </button>
            </div>

            <form
              action={(formData) => startTransition(() => { crearPartido(zonaId, formData); })}
              className="flex flex-wrap items-end gap-2 text-sm border-t border-neutral-100 pt-3"
            >
              <input type="hidden" name="fixture_fecha_id" value={fecha.id} />
              <label className="flex flex-col gap-1">
                Local
                <select name="equipo_local_id" className="border border-neutral-300 rounded px-2 py-1">
                  <option value="">—</option>
                  {equipos.map((e) => (
                    <option key={e.id} value={e.id}>{e.nombre}</option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1">
                Visitante
                <select name="equipo_visitante_id" className="border border-neutral-300 rounded px-2 py-1">
                  <option value="">—</option>
                  {equipos.map((e) => (
                    <option key={e.id} value={e.id}>{e.nombre}</option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1">
                Hora
                <input type="time" name="hora" className="border border-neutral-300 rounded px-2 py-1" />
              </label>
              <label className="flex flex-col gap-1">
                Estadio
                <input name="estadio" className="border border-neutral-300 rounded px-2 py-1" />
              </label>
              <label className="flex flex-col gap-1">
                O libre
                <select name="libre_equipo_id" className="border border-neutral-300 rounded px-2 py-1">
                  <option value="">—</option>
                  {equipos.map((e) => (
                    <option key={e.id} value={e.id}>{e.nombre}</option>
                  ))}
                </select>
              </label>
              <button
                type="submit"
                disabled={isPending}
                className="bg-dorado hover:bg-dorado-oscuro text-white rounded px-3 py-1.5 disabled:opacity-50"
              >
                Agregar partido
              </button>
            </form>

            <ul className="flex flex-col gap-1">
              {fecha.partidos.map((partido) => (
                <li
                  key={partido.id}
                  className="flex flex-col gap-2 text-sm border border-neutral-100 rounded px-3 py-1.5"
                >
                  <div className="flex items-center justify-between">
                    {partido.libre_equipo_id ? (
                      <span>{nombreEquipo(partido.libre_equipo_id)} — libre</span>
                    ) : (
                      <Link href={`/admin/partidos/${partido.id}`} className="hover:text-dorado-oscuro">
                        {nombreEquipo(partido.equipo_local_id)} vs {nombreEquipo(partido.equipo_visitante_id)}
                        {partido.estado === "jugado" && (
                          <> — {partido.resultado_local} a {partido.resultado_visitante}</>
                        )}
                      </Link>
                    )}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() =>
                          setPartidoEditando(partidoEditando === partido.id ? null : partido.id)
                        }
                        className="text-celeste-oscuro text-xs hover:underline"
                      >
                        {partidoEditando === partido.id ? "Cerrar edición" : "Editar"}
                      </button>
                      <button
                        onClick={() => startTransition(() => { eliminarPartido(zonaId, partido.id); })}
                        className="text-red-600 text-xs hover:underline"
                      >
                        Quitar
                      </button>
                    </div>
                  </div>
                  {partidoEditando === partido.id && (
                    <EditarPartidoForm
                      zonaId={zonaId}
                      partido={partido}
                      equipos={equipos}
                      onGuardado={() => setPartidoEditando(null)}
                    />
                  )}
                </li>
              ))}
              {fecha.partidos.length === 0 && (
                <p className="text-neutral-400 text-sm">Sin partidos cargados.</p>
              )}
            </ul>
          </section>
        ))}
        {fechas.length === 0 && (
          <p className="text-neutral-500 text-sm">Todavía no hay fechas cargadas.</p>
        )}
      </div>
    </div>
  );
}

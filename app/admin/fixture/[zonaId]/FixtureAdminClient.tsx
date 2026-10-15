"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { crearFecha, crearPartido, editarPartido, eliminarFecha, eliminarPartido } from "./actions";
import { diaCorto } from "@/lib/dias";

type Equipo = { id: string; nombre: string };
type Partido = {
  id: string;
  equipo_local_id: string | null;
  equipo_visitante_id: string | null;
  libre_equipo_id: string | null;
  fecha: string | null;
  hora: string | null;
  estadio: string | null;
  estado: string;
  resultado_local: number | null;
  resultado_visitante: number | null;
};
type Fecha = { id: string; numero_fecha: number; fecha: string | null; partidos: Partido[] };

const INPUT = "border border-neutral-300 rounded px-2 py-1";

/** Ordena por día y hora; los partidos sin día quedan al final. */
function ordenarPartidos(partidos: Partido[]) {
  return [...partidos].sort((a, b) => {
    const da = a.fecha ?? "9999-99-99";
    const db = b.fecha ?? "9999-99-99";
    return da.localeCompare(db) || (a.hora ?? "").localeCompare(b.hora ?? "");
  });
}

function EditarPartidoForm({
  zonaId,
  partido,
  equipos,
  fechaJornada,
  onGuardado,
}: {
  zonaId: string;
  partido: Partido;
  equipos: Equipo[];
  fechaJornada: string | null;
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
        Día del partido
        <input
          type="date"
          name="fecha"
          defaultValue={partido.fecha ?? fechaJornada ?? ""}
          className={INPUT}
        />
      </label>
      <label className="flex flex-col gap-1">
        Hora
        <input
          type="time"
          name="hora"
          defaultValue={partido.hora ? partido.hora.slice(0, 5) : ""}
          className={INPUT}
        />
      </label>
      <label className="flex flex-col gap-1">
        Local
        <select name="equipo_local_id" defaultValue={partido.equipo_local_id ?? ""} className={INPUT}>
          <option value="">—</option>
          {equipos.map((e) => (
            <option key={e.id} value={e.id}>{e.nombre}</option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1">
        Visitante
        <select name="equipo_visitante_id" defaultValue={partido.equipo_visitante_id ?? ""} className={INPUT}>
          <option value="">—</option>
          {equipos.map((e) => (
            <option key={e.id} value={e.id}>{e.nombre}</option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1">
        Estadio
        <input name="estadio" defaultValue={partido.estadio ?? ""} className={INPUT} />
      </label>
      <label className="flex flex-col gap-1">
        O libre
        <select name="libre_equipo_id" defaultValue={partido.libre_equipo_id ?? ""} className={INPUT}>
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

  // Jornada que se está viendo: por defecto la más reciente (número más alto).
  const ordenadas = [...fechas].sort((a, b) => b.numero_fecha - a.numero_fecha);
  const [seleccionada, setSeleccionada] = useState<string | null>(null);
  const cantidadAnterior = useRef(fechas.length);

  // Cuando se agrega una jornada nueva, pasa a verse esa.
  useEffect(() => {
    if (fechas.length > cantidadAnterior.current && ordenadas[0]) {
      setSeleccionada(ordenadas[0].id);
    }
    cantidadAnterior.current = fechas.length;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fechas.length]);

  const fecha = ordenadas.find((f) => f.id === seleccionada) ?? ordenadas[0] ?? null;
  const partidos = fecha ? ordenarPartidos(fecha.partidos) : [];
  // Para agilizar la carga: el nuevo partido arranca con el día del último cargado.
  const ultimoDia = [...partidos].reverse().find((p) => p.fecha)?.fecha ?? fecha?.fecha ?? "";

  return (
    <div className="flex flex-col gap-6">
      {/* 1) Crear la jornada: solo el número. El día se define en cada partido. */}
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
        <button
          type="submit"
          disabled={isPending}
          className="bg-dorado hover:bg-dorado-oscuro text-white font-semibold rounded px-4 py-2 disabled:opacity-50"
        >
          Agregar fecha
        </button>
        <p className="text-xs text-neutral-500 basis-full">
          Primero creás la fecha (13, 14, 15…) y después programás cada partido con su día,
          hora y estadio.
        </p>
      </form>

      {/* 2) Elegir qué fecha ver */}
      {ordenadas.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm font-semibold">
            Ver fecha
            <select
              value={fecha?.id ?? ""}
              onChange={(e) => {
                setSeleccionada(e.target.value);
                setPartidoEditando(null);
              }}
              className="border border-neutral-300 rounded px-3 py-2 bg-white font-normal"
            >
              {ordenadas.map((f) => (
                <option key={f.id} value={f.id}>
                  Fecha {f.numero_fecha} ({f.partidos.length} {f.partidos.length === 1 ? "partido" : "partidos"})
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      {/* 3) La fecha elegida: programar partidos y ver/cargar resultados */}
      {fecha && (
        <section className="bg-white border border-neutral-200 rounded-lg p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Fecha {fecha.numero_fecha}</h2>
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
              Día del partido
              <input type="date" name="fecha" defaultValue={ultimoDia} className={INPUT} />
            </label>
            <label className="flex flex-col gap-1">
              Hora
              <input type="time" name="hora" className={INPUT} />
            </label>
            <label className="flex flex-col gap-1">
              Local
              <select name="equipo_local_id" className={INPUT}>
                <option value="">—</option>
                {equipos.map((e) => (
                  <option key={e.id} value={e.id}>{e.nombre}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              Visitante
              <select name="equipo_visitante_id" className={INPUT}>
                <option value="">—</option>
                {equipos.map((e) => (
                  <option key={e.id} value={e.id}>{e.nombre}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              Estadio
              <input name="estadio" className={INPUT} />
            </label>
            <label className="flex flex-col gap-1">
              O libre
              <select name="libre_equipo_id" className={INPUT}>
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
            {partidos.map((partido) => (
              <li
                key={partido.id}
                className="flex flex-col gap-2 text-sm border border-neutral-100 rounded px-3 py-1.5"
              >
                <div className="flex items-center justify-between gap-3">
                  {partido.libre_equipo_id ? (
                    <span>{nombreEquipo(partido.libre_equipo_id)} — libre</span>
                  ) : (
                    <Link href={`/admin/partidos/${partido.id}`} className="hover:text-dorado-oscuro">
                      <span className="text-neutral-500 text-xs mr-2">
                        {diaCorto(partido.fecha ?? fecha.fecha) ?? "Sin día"}
                        {partido.hora ? ` · ${partido.hora.slice(0, 5)}` : ""}
                      </span>
                      {nombreEquipo(partido.equipo_local_id)} vs {nombreEquipo(partido.equipo_visitante_id)}
                      {partido.estado === "jugado" ? (
                        <span className="font-bold text-celeste-oscuro">
                          {" "}— {partido.resultado_local} a {partido.resultado_visitante}
                        </span>
                      ) : (
                        <span className="text-neutral-400"> · sin resultado</span>
                      )}
                    </Link>
                  )}
                  <div className="flex items-center gap-3 shrink-0">
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
                    fechaJornada={fecha.fecha}
                    onGuardado={() => setPartidoEditando(null)}
                  />
                )}
              </li>
            ))}
            {partidos.length === 0 && (
              <p className="text-neutral-400 text-sm">Sin partidos programados.</p>
            )}
          </ul>
        </section>
      )}

      {ordenadas.length === 0 && (
        <p className="text-neutral-500 text-sm">Todavía no hay fechas cargadas.</p>
      )}
    </div>
  );
}

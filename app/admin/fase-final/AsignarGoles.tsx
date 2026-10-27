"use client";

import { useState, useTransition } from "react";
import { formatearNombre, normalizar } from "@/lib/goleadores";
import { asignarGolesJugador, cambiarGolesAsignados } from "./goles-actions";

export type JugadorPool = { jugador: string; club_id: string };
export type Asignacion = {
  id: string;
  partido_id: string;
  jugador: string;
  club_id: string;
  goles: number;
};
type Club = { id: string; nombre: string };

const INPUT = "border border-neutral-300 rounded px-2 py-1 text-sm";

/**
 * Asignar goles a jugadores dentro de un partido: se escribe el apellido o el nombre, la
 * lista muestra los jugadores de los dos clubes que coinciden, se elige uno y se le asignan
 * los goles. Si el jugador no está en la lista, se lo agrega como nuevo.
 */
export function AsignarGoles({
  partidoId,
  clubes,
  pool,
  asignados,
  golesPorClub,
}: {
  partidoId: string;
  clubes: Club[];
  pool: JugadorPool[];
  asignados: Asignacion[];
  /** Goles del marcador de este partido, por club (para avisar si falta asignar). */
  golesPorClub: Record<string, number | null>;
}) {
  const [consulta, setConsulta] = useState("");
  const [abierto, setAbierto] = useState(false);
  const [sel, setSel] = useState<{ jugador: string; club_id: string; nuevo: boolean } | null>(null);
  const [goles, setGoles] = useState(1);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok?: string; error?: string } | null>(null);

  const idsClubes = new Set(clubes.map((c) => c.id));
  const nombreClub = (id: string) => clubes.find((c) => c.id === id)?.nombre ?? "";

  const palabras = normalizar(consulta).split(" ").filter(Boolean);
  const resultados = consulta.trim()
    ? pool
        .filter((p) => idsClubes.has(p.club_id) && palabras.every((w) => normalizar(p.jugador).includes(w)))
        .slice(0, 8)
    : [];
  const hayExacto = resultados.some((r) => normalizar(r.jugador) === normalizar(consulta));

  function elegir(s: { jugador: string; club_id: string; nuevo: boolean }) {
    setSel(s);
    setConsulta("");
    setAbierto(false);
    setMsg(null);
  }

  function asignar() {
    if (!sel || !sel.club_id) return;
    start(async () => {
      const r = await asignarGolesJugador(partidoId, sel.jugador, sel.club_id, goles);
      setMsg(r as { ok?: string; error?: string });
      if ("ok" in r) {
        setSel(null);
        setGoles(1);
      }
    });
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-sm">
      <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">Goleadores de este partido</p>

      {/* Buscador */}
      <div className="relative">
        <input
          value={consulta}
          onChange={(e) => {
            setConsulta(e.target.value);
            setAbierto(true);
          }}
          onFocus={() => setAbierto(true)}
          placeholder="Escribí el apellido o el nombre del jugador…"
          className={`${INPUT} w-full`}
          autoComplete="off"
        />
        {abierto && consulta.trim() && (
          <div className="absolute z-20 mt-1 max-h-72 w-full overflow-auto rounded border border-neutral-300 bg-white shadow-lg">
            {resultados.map((r) => (
              <button
                type="button"
                key={`${r.jugador}-${r.club_id}`}
                onClick={() => elegir({ jugador: r.jugador, club_id: r.club_id, nuevo: false })}
                className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left hover:bg-neutral-100"
              >
                <span className="font-semibold text-celeste-oscuro">{formatearNombre(r.jugador)}</span>
                <span className="text-xs text-neutral-500">{nombreClub(r.club_id)}</span>
              </button>
            ))}
            {!hayExacto && consulta.trim().length >= 3 && (
              <button
                type="button"
                onClick={() => elegir({ jugador: consulta.trim().toUpperCase(), club_id: "", nuevo: true })}
                className="w-full border-t border-neutral-200 px-3 py-2 text-left text-dorado-oscuro hover:bg-neutral-100"
              >
                ➕ Agregar «{consulta.trim().toUpperCase()}» como jugador nuevo
              </button>
            )}
            {resultados.length === 0 && consulta.trim().length < 3 && (
              <p className="px-3 py-2 text-xs text-neutral-500">Seguí escribiendo…</p>
            )}
          </div>
        )}
      </div>

      {/* Jugador elegido */}
      {sel && (
        <div className="flex flex-wrap items-end gap-3 rounded border border-dorado/40 bg-white p-3">
          <div className="flex min-w-[12rem] flex-1 flex-col">
            <span className="font-bold text-celeste-oscuro">{formatearNombre(sel.jugador)}</span>
            {sel.nuevo ? (
              <label className="mt-1 flex flex-col gap-1 text-xs text-neutral-600">
                ¿De qué club es?
                <select
                  value={sel.club_id}
                  onChange={(e) => setSel({ ...sel, club_id: e.target.value })}
                  className={INPUT}
                >
                  <option value="">Elegí el club…</option>
                  {clubes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <span className="text-xs text-neutral-500">{nombreClub(sel.club_id)}</span>
            )}
          </div>
          <label className="flex flex-col gap-1 text-xs text-neutral-600">
            Goles
            <input
              type="number"
              min={1}
              max={20}
              value={goles}
              onChange={(e) => setGoles(Number(e.target.value))}
              className={`${INPUT} w-20`}
            />
          </label>
          <button
            type="button"
            disabled={pending || !sel.club_id}
            onClick={asignar}
            className="rounded bg-dorado px-3 py-1.5 font-semibold text-white hover:bg-dorado-oscuro disabled:opacity-50"
          >
            {pending ? "Guardando…" : "Asignar"}
          </button>
          <button type="button" onClick={() => setSel(null)} className="text-xs text-neutral-500 hover:underline">
            Cancelar
          </button>
        </div>
      )}
      {msg?.ok && <p className="text-xs text-green-700">{msg.ok}</p>}
      {msg?.error && <p className="text-xs text-red-600">{msg.error}</p>}

      {/* Ya asignados en este partido */}
      {asignados.length > 0 && (
        <ul className="flex flex-col divide-y divide-neutral-200 rounded border border-neutral-200 bg-white">
          {asignados.map((a) => (
            <li key={a.id} className="flex items-center gap-3 px-3 py-2">
              <span className="flex-1">
                <span className="font-semibold text-celeste-oscuro">{formatearNombre(a.jugador)}</span>{" "}
                <span className="text-xs text-neutral-500">· {nombreClub(a.club_id)}</span>
              </span>
              <button
                type="button"
                disabled={pending}
                onClick={() => start(async () => void (await cambiarGolesAsignados(a.id, a.goles - 1)))}
                className="h-6 w-6 rounded bg-neutral-200 font-bold disabled:opacity-50"
                aria-label="Quitar un gol"
              >
                −
              </button>
              <span className="w-12 text-center font-bold">
                {a.goles} {a.goles === 1 ? "gol" : "goles"}
              </span>
              <button
                type="button"
                disabled={pending}
                onClick={() => start(async () => void (await cambiarGolesAsignados(a.id, a.goles + 1)))}
                className="h-6 w-6 rounded bg-neutral-200 font-bold disabled:opacity-50"
                aria-label="Sumar un gol"
              >
                +
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => start(async () => void (await cambiarGolesAsignados(a.id, 0)))}
                className="text-xs font-semibold text-red-600 hover:underline disabled:opacity-50"
              >
                Quitar
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Control contra el marcador */}
      <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs">
        {clubes.map((c) => {
          const total = golesPorClub[c.id];
          if (total === null || total === undefined) return null;
          const asig = asignados.filter((a) => a.club_id === c.id).reduce((s, a) => s + a.goles, 0);
          const falta = total - asig;
          return (
            <span
              key={c.id}
              className={falta === 0 ? "text-green-700" : falta > 0 ? "text-dorado-oscuro" : "text-red-600"}
            >
              {c.nombre}: {total} {total === 1 ? "gol" : "goles"} en el partido · {asig} asignados
              {falta > 0 ? ` · faltan ${falta}` : falta < 0 ? ` · sobran ${-falta}` : " ✓"}
            </span>
          );
        })}
      </div>
    </div>
  );
}

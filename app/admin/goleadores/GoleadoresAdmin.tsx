"use client";

import { useState, useTransition } from "react";
import { formatearNombre } from "@/lib/goleadores";
import {
  actualizarGoles,
  eliminarGoleador,
  guardarGoleador,
  importarComet,
  revisarComet,
} from "./actions";

type Fila = { id: string; puesto: number; jugador: string; club_id: string | null; club_nombre: string; goles: number };
type Club = { id: string; nombre: string };
type Revision = {
  jugadores: number;
  goles: number;
  autogoles: string[];
  sinClub: string[];
  ignoradas: string[];
};

const INPUT = "border border-neutral-300 rounded px-2 py-1 text-sm";

export function GoleadoresAdmin({
  ambito,
  temporada,
  etiqueta,
  filas,
  clubes,
}: {
  ambito: string;
  temporada: string;
  etiqueta: string;
  filas: Fila[];
  clubes: Club[];
}) {
  return (
    <div className="flex flex-col gap-6">
      <ImportarComet ambito={ambito} temporada={temporada} etiqueta={etiqueta} hayFilas={filas.length > 0} />
      <AgregarJugador ambito={ambito} temporada={temporada} clubes={clubes} />
      <Lista filas={filas} etiqueta={etiqueta} />
    </div>
  );
}

function ImportarComet({
  ambito,
  temporada,
  etiqueta,
  hayFilas,
}: {
  ambito: string;
  temporada: string;
  etiqueta: string;
  hayFilas: boolean;
}) {
  const [texto, setTexto] = useState("");
  const [rev, setRev] = useState<Revision | null>(null);
  const [msg, setMsg] = useState<{ ok?: string; error?: string } | null>(null);
  const [pending, start] = useTransition();

  return (
    <details className="rounded-lg border border-neutral-200 bg-white p-4" open={!hayFilas}>
      <summary className="cursor-pointer font-semibold text-celeste-oscuro">
        Importar el reporte de COMET ({etiqueta})
      </summary>
      <div className="mt-3 flex flex-col gap-3 text-sm">
        <p className="text-neutral-500">
          Abrí el PDF &quot;Goleadores&quot; de COMET, copiá todo el texto y pegalo acá. Los totales de COMET
          son acumulados, por eso <b>reemplaza la lista completa de {etiqueta}</b>. Los goles en contra
          (&quot;Autogol&quot;) no se cuentan.
        </p>
        <textarea
          value={texto}
          onChange={(e) => {
            setTexto(e.target.value);
            setRev(null);
            setMsg(null);
          }}
          rows={8}
          placeholder={"7\nACOSTA ABBRUZZESE, MATIAS (BARRIO INDEPENDENCIA)\n…"}
          className={`${INPUT} w-full font-mono text-xs`}
        />
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={pending || !texto.trim()}
            onClick={() =>
              start(async () => {
                const r = await revisarComet(texto);
                if ("error" in r && r.error) setMsg({ error: r.error });
                else {
                  setRev(r as Revision);
                  setMsg(null);
                }
              })
            }
            className="rounded bg-neutral-200 px-3 py-1.5 font-semibold disabled:opacity-50"
          >
            Revisar
          </button>
          {rev && rev.jugadores > 0 && (
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                start(async () => {
                  const r = await importarComet(ambito, temporada, texto);
                  setMsg(r as { ok?: string; error?: string });
                  if ("ok" in r) {
                    setRev(null);
                    setTexto("");
                  }
                })
              }
              className="rounded bg-dorado px-3 py-1.5 font-semibold text-white hover:bg-dorado-oscuro disabled:opacity-50"
            >
              {pending ? "Guardando…" : `Reemplazar la lista de ${etiqueta}`}
            </button>
          )}
          {msg?.ok && <span className="text-green-700">{msg.ok}</span>}
          {msg?.error && <span className="text-red-600">{msg.error}</span>}
        </div>

        {rev && (
          <div className="rounded border border-neutral-200 bg-neutral-50 p-3">
            <p>
              Encontré <b>{rev.jugadores} jugadores</b> y <b>{rev.goles} goles</b>.
            </p>
            {rev.autogoles.length > 0 && (
              <p className="text-neutral-600">Goles en contra (no se cargan): {rev.autogoles.join(", ")}</p>
            )}
            {rev.sinClub.length > 0 && (
              <p className="text-dorado-oscuro">
                Clubes que no están en &quot;Clubes&quot; (se cargan igual, con el nombre del reporte y sin escudo):{" "}
                {rev.sinClub.join(", ")}
              </p>
            )}
            {rev.ignoradas.length > 0 && (
              <p className="text-red-600">Líneas que no pude leer: {rev.ignoradas.join(" | ")}</p>
            )}
          </div>
        )}
      </div>
    </details>
  );
}

function AgregarJugador({
  ambito,
  temporada,
  clubes,
}: {
  ambito: string;
  temporada: string;
  clubes: Club[];
}) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok?: string; error?: string } | null>(null);
  const [clubId, setClubId] = useState("");

  return (
    <form
      action={(fd) =>
        start(async () => {
          const r = await guardarGoleador(ambito, temporada, fd);
          setMsg(r as { ok?: string; error?: string });
        })
      }
      className="flex flex-wrap items-end gap-3 rounded-lg border border-neutral-200 bg-white p-4 text-sm"
    >
      <p className="w-full font-semibold text-celeste-oscuro">Agregar o corregir un jugador</p>
      <label className="flex min-w-[14rem] flex-1 flex-col gap-1">
        Jugador (APELLIDO, NOMBRE)
        <input name="jugador" required className={INPUT} />
      </label>
      <label className="flex flex-col gap-1">
        Club
        <select name="club_id" value={clubId} onChange={(e) => setClubId(e.target.value)} className={INPUT}>
          <option value="">Otro (escribir)…</option>
          {clubes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
      </label>
      {!clubId && (
        <label className="flex flex-col gap-1">
          Club (si no está en la lista)
          <input name="club_otro" className={INPUT} />
        </label>
      )}
      <label className="flex flex-col gap-1">
        Goles
        <input name="goles" type="number" min={0} required className={`${INPUT} w-20`} />
      </label>
      <button
        disabled={pending}
        className="rounded bg-dorado px-3 py-1.5 font-semibold text-white hover:bg-dorado-oscuro disabled:opacity-50"
      >
        {pending ? "Guardando…" : "Guardar"}
      </button>
      {msg?.ok && <span className="text-green-700">{msg.ok}</span>}
      {msg?.error && <span className="text-red-600">{msg.error}</span>}
    </form>
  );
}

function Lista({ filas, etiqueta }: { filas: Fila[]; etiqueta: string }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (filas.length === 0) {
    return <p className="text-sm text-neutral-500">Todavía no hay goleadores cargados en {etiqueta}.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-neutral-500">
        {filas.length} jugadores · {filas.reduce((s, f) => s + f.goles, 0)} goles. Cambiá los goles y salí del
        casillero para guardar.
      </p>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-celeste-oscuro text-left text-white">
              <th className="p-2 font-semibold">#</th>
              <th className="p-2 font-semibold">Jugador</th>
              <th className="p-2 font-semibold">Club</th>
              <th className="p-2 text-center font-semibold">Goles</th>
              <th className="p-2" />
            </tr>
          </thead>
          <tbody>
            {filas.map((f) => (
              <tr key={f.id} className="border-b border-neutral-100 last:border-0">
                <td className="p-2 text-neutral-500">{f.puesto}</td>
                <td className="p-2 font-semibold text-celeste-oscuro">{formatearNombre(f.jugador)}</td>
                <td className="p-2 text-neutral-600">{f.club_nombre}</td>
                <td className="p-2 text-center">
                  <input
                    type="number"
                    min={0}
                    defaultValue={f.goles}
                    disabled={pending}
                    onBlur={(e) => {
                      const n = Number(e.target.value);
                      if (n === f.goles || e.target.value === "") return;
                      start(async () => {
                        const r = await actualizarGoles(f.id, n);
                        setError(r?.error ?? null);
                      });
                    }}
                    className={`${INPUT} w-16 text-center`}
                  />
                </td>
                <td className="p-2 text-right">
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => {
                      if (!confirm(`¿Borrar a ${formatearNombre(f.jugador)}?`)) return;
                      start(async () => {
                        const r = await eliminarGoleador(f.id);
                        setError(r?.error ?? null);
                      });
                    }}
                    className="text-xs font-semibold text-red-600 hover:underline disabled:opacity-50"
                  >
                    Borrar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import {
  RONDA_LABEL,
  type ClubFF,
  type CruceResuelto,
  type PartidoCruce,
} from "@/lib/fase-final";
import { guardarClubesCruce, guardarPartidoCruce, guardarPenalesCruce } from "./actions";
import { AsignarGoles, type Asignacion, type JugadorPool } from "./AsignarGoles";

const INPUT = "border border-neutral-300 rounded px-2 py-1 text-sm";
const ORDEN_RONDAS = ["final_anual", "fase1", "fase2", "semifinal", "final"] as const;

export function FaseFinalAdmin({
  cruces,
  clubes,
  pool,
  asignaciones,
}: {
  cruces: CruceResuelto[];
  clubes: ClubFF[];
  pool: JugadorPool[];
  asignaciones: Asignacion[];
}) {
  return (
    <div className="flex flex-col gap-8">
      {ORDEN_RONDAS.map((ronda) => {
        const lista = cruces.filter((c) => c.ronda === ronda).sort((a, b) => a.orden - b.orden);
        if (lista.length === 0) return null;
        return (
          <section key={ronda} className="flex flex-col gap-3">
            <h2 className="text-lg font-bold text-celeste-oscuro">{RONDA_LABEL[ronda]}</h2>
            <div className="grid gap-3 lg:grid-cols-2">
              {lista.map((c) => (
                <CruceAdmin key={c.id} c={c} clubes={clubes} pool={pool} asignaciones={asignaciones} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function Aviso({ msg }: { msg: string | null }) {
  return msg ? <span className="text-xs text-red-600">{msg}</span> : null;
}

function CruceAdmin({
  c,
  clubes,
  pool,
  asignaciones,
}: {
  c: CruceResuelto;
  clubes: ClubFF[];
  pool: JugadorPool[];
  asignaciones: Asignacion[];
}) {
  const nombreA = c.a?.nombre ?? c.etiquetaA;
  const nombreB = c.b?.nombre ?? c.etiquetaB;
  const tipos: PartidoCruce["tipo"][] = c.formato === "unico" ? ["unico"] : ["ida", "vuelta"];

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            {RONDA_LABEL[c.ronda]} · cruce {c.codigo.toUpperCase()} ·{" "}
            {c.formato === "unico" ? "partido único" : "ida y vuelta"}
          </p>
          <p className="font-bold text-celeste-oscuro">
            {nombreA} <span className="font-normal text-neutral-400">vs</span> {nombreB}
          </p>
        </div>
        <div className="shrink-0 text-right text-xs">
          {c.golesA !== null && (
            <p className="font-bold">
              Global {c.golesA}-{c.golesB}
            </p>
          )}
          {c.ganador && (
            <p className="font-semibold text-dorado-oscuro">Avanza: {c.ganador.nombre}</p>
          )}
          {c.pendientePenales && (
            <p className="font-semibold text-red-600">Empate: cargá los penales</p>
          )}
        </div>
      </div>

      {(!c.origen_a || !c.origen_b) && <FormClubes c={c} clubes={clubes} />}

      {tipos.map((tipo) => {
        const partido = c.partidos.find((p) => p.tipo === tipo);
        return (
          <div key={tipo} className="flex flex-col gap-2">
            <FormPartido c={c} tipo={tipo} partido={partido} nombreA={nombreA} nombreB={nombreB} />
            {partido && c.a && c.b && (
              <AsignarGoles
                partidoId={partido.id}
                clubes={[
                  { id: c.a.id, nombre: c.a.nombre },
                  { id: c.b.id, nombre: c.b.nombre },
                ]}
                pool={pool}
                asignados={asignaciones.filter((x) => x.partido_id === partido.id)}
                golesPorClub={{ [c.a.id]: partido.goles_a, [c.b.id]: partido.goles_b }}
              />
            )}
          </div>
        );
      })}

      {c.completo && c.golesA === c.golesB && <FormPenales c={c} nombreA={nombreA} nombreB={nombreB} />}
    </div>
  );
}

function FormClubes({ c, clubes }: { c: CruceResuelto; clubes: ClubFF[] }) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <form
      action={(fd) =>
        start(async () => {
          const r = await guardarClubesCruce(c.id, fd);
          setMsg(r?.error ?? null);
        })
      }
      className="flex flex-wrap items-end gap-2 border-t border-neutral-100 pt-3 text-xs"
    >
      {!c.origen_a && (
        <label className="flex flex-col gap-1">
          Club A (local en la ida)
          <select name="club_a_id" defaultValue={c.club_a_id ?? ""} className={INPUT}>
            <option value="">—</option>
            {clubes.map((k) => (
              <option key={k.id} value={k.id}>
                {k.nombre}
              </option>
            ))}
          </select>
        </label>
      )}
      {!c.origen_b && (
        <label className="flex flex-col gap-1">
          Club B
          <select name="club_b_id" defaultValue={c.club_b_id ?? ""} className={INPUT}>
            <option value="">—</option>
            {clubes.map((k) => (
              <option key={k.id} value={k.id}>
                {k.nombre}
              </option>
            ))}
          </select>
        </label>
      )}
      <button disabled={pending} className="rounded bg-neutral-200 px-3 py-1 font-semibold disabled:opacity-50">
        {pending ? "Guardando…" : "Guardar clubes"}
      </button>
      <Aviso msg={msg} />
    </form>
  );
}

function FormPartido({
  c,
  tipo,
  partido,
  nombreA,
  nombreB,
}: {
  c: CruceResuelto;
  tipo: PartidoCruce["tipo"];
  partido?: PartidoCruce;
  nombreA: string;
  nombreB: string;
}) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  // Local: en la ida es A, en la vuelta B.
  const local = tipo === "vuelta" ? nombreB : nombreA;
  const visitante = tipo === "vuelta" ? nombreA : nombreB;
  const titulo = tipo === "ida" ? "Ida" : tipo === "vuelta" ? "Vuelta" : "Partido único";

  const golesLocal = tipo === "vuelta" ? partido?.goles_b : partido?.goles_a;
  const golesVisit = tipo === "vuelta" ? partido?.goles_a : partido?.goles_b;

  return (
    <form
      action={(fd) =>
        start(async () => {
          // El formulario muestra local/visitante; se guarda por club (A/B).
          const gl = fd.get("goles_local");
          const gv = fd.get("goles_visit");
          fd.set("goles_a", String(tipo === "vuelta" ? gv : gl));
          fd.set("goles_b", String(tipo === "vuelta" ? gl : gv));
          const r = await guardarPartidoCruce(c.id, tipo, fd);
          setMsg(r?.error ?? null);
          setOk(!r?.error);
        })
      }
      className="flex flex-col gap-2 border-t border-neutral-100 pt-3"
    >
      <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">
        {titulo}: {local} (local) vs {visitante}
      </p>
      <div className="flex flex-wrap items-end gap-2 text-xs">
        <label className="flex flex-col gap-1">
          Día
          <input type="date" name="fecha" defaultValue={partido?.fecha ?? ""} className={INPUT} />
        </label>
        <label className="flex flex-col gap-1">
          Hora
          <input type="time" name="hora" defaultValue={partido?.hora?.slice(0, 5) ?? ""} className={INPUT} />
        </label>
        <label className="flex min-w-[9rem] flex-1 flex-col gap-1">
          Estadio
          <input name="estadio" defaultValue={partido?.estadio ?? ""} className={INPUT} />
        </label>
      </div>
      <div className="flex flex-wrap items-end gap-2 text-xs">
        <label className="flex flex-col gap-1">
          Goles {local}
          <input
            type="number"
            min={0}
            name="goles_local"
            defaultValue={golesLocal ?? ""}
            className={`${INPUT} w-20`}
          />
        </label>
        <label className="flex flex-col gap-1">
          Goles {visitante}
          <input
            type="number"
            min={0}
            name="goles_visit"
            defaultValue={golesVisit ?? ""}
            className={`${INPUT} w-20`}
          />
        </label>
        <button
          disabled={pending}
          className="rounded bg-dorado px-3 py-1.5 font-semibold text-white hover:bg-dorado-oscuro disabled:opacity-50"
        >
          {pending ? "Guardando…" : "Guardar"}
        </button>
        {ok && !msg && <span className="text-green-700">Guardado</span>}
        <Aviso msg={msg} />
      </div>
    </form>
  );
}

function FormPenales({
  c,
  nombreA,
  nombreB,
}: {
  c: CruceResuelto;
  nombreA: string;
  nombreB: string;
}) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <form
      action={(fd) =>
        start(async () => {
          const r = await guardarPenalesCruce(c.id, fd);
          setMsg(r?.error ?? null);
        })
      }
      className="flex flex-wrap items-end gap-2 border-t border-neutral-100 pt-3 text-xs"
    >
      <span className="w-full font-bold uppercase tracking-wider text-neutral-500">Penales</span>
      <label className="flex flex-col gap-1">
        {nombreA}
        <input type="number" min={0} name="penales_a" defaultValue={c.penales_a ?? ""} className={`${INPUT} w-20`} />
      </label>
      <label className="flex flex-col gap-1">
        {nombreB}
        <input type="number" min={0} name="penales_b" defaultValue={c.penales_b ?? ""} className={`${INPUT} w-20`} />
      </label>
      <button disabled={pending} className="rounded bg-dorado px-3 py-1.5 font-semibold text-white disabled:opacity-50">
        {pending ? "Guardando…" : "Guardar penales"}
      </button>
      <Aviso msg={msg} />
    </form>
  );
}

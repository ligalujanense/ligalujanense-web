"use client";

import { useTransition } from "react";
import {
  guardarResultado,
  agregarGol,
  eliminarGol,
  agregarTarjeta,
  eliminarTarjeta,
  guardarPlanilla,
} from "./actions";
import { PdfUploader } from "@/components/admin/PdfUploader";

type Equipo = { id: string; nombre: string };
type Gol = { id: string; equipo_id: string | null; jugador: string; minuto: number | null };
type Tarjeta = {
  id: string;
  equipo_id: string | null;
  jugador: string;
  tipo: string;
  minuto: number | null;
  motivo: string | null;
};
type Planilla = { equipo_id: string; pdf_url: string; estado: string };

export function PartidoAdminClient({
  partidoId,
  local,
  visitante,
  resultadoLocal,
  resultadoVisitante,
  goles,
  tarjetas,
  planillas,
}: {
  partidoId: string;
  local: Equipo;
  visitante: Equipo;
  resultadoLocal: number | null;
  resultadoVisitante: number | null;
  goles: Gol[];
  tarjetas: Tarjeta[];
  planillas: Planilla[];
}) {
  const [isPending, startTransition] = useTransition();
  const equipos = [local, visitante];
  const nombreEquipo = (id: string | null) => equipos.find((e) => e.id === id)?.nombre ?? "?";
  const planillaDe = (equipoId: string) => planillas.find((p) => p.equipo_id === equipoId);

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      <section className="bg-white border border-neutral-200 rounded-lg p-4 flex flex-col gap-3">
        <h2 className="font-semibold">Resultado</h2>
        <form
          action={(formData) => startTransition(() => { guardarResultado(partidoId, formData); })}
          className="flex items-center gap-3"
        >
          <span>{local.nombre}</span>
          <input
            type="number"
            name="resultado_local"
            min={0}
            defaultValue={resultadoLocal ?? ""}
            className="border border-neutral-300 rounded px-2 py-1 w-16 text-center"
          />
          <span>-</span>
          <input
            type="number"
            name="resultado_visitante"
            min={0}
            defaultValue={resultadoVisitante ?? ""}
            className="border border-neutral-300 rounded px-2 py-1 w-16 text-center"
          />
          <span>{visitante.nombre}</span>
          <button
            type="submit"
            disabled={isPending}
            className="bg-dorado hover:bg-dorado-oscuro text-white rounded px-3 py-1.5 disabled:opacity-50"
          >
            Guardar
          </button>
        </form>
      </section>

      <section className="bg-white border border-neutral-200 rounded-lg p-4 flex flex-col gap-3">
        <h2 className="font-semibold">Goles</h2>
        <form
          action={(formData) => startTransition(() => { agregarGol(partidoId, formData); })}
          className="flex flex-wrap items-end gap-2 text-sm"
        >
          <select name="equipo_id" required className="border border-neutral-300 rounded px-2 py-1">
            {equipos.map((e) => (
              <option key={e.id} value={e.id}>{e.nombre}</option>
            ))}
          </select>
          <input name="jugador" placeholder="Jugador" required className="border border-neutral-300 rounded px-2 py-1" />
          <input type="number" name="minuto" placeholder="Min" className="border border-neutral-300 rounded px-2 py-1 w-16" />
          <button type="submit" disabled={isPending} className="bg-dorado hover:bg-dorado-oscuro text-white rounded px-3 py-1.5 disabled:opacity-50">
            Agregar gol
          </button>
        </form>
        <ul className="flex flex-col gap-1 text-sm">
          {goles.map((gol) => (
            <li key={gol.id} className="flex items-center justify-between border border-neutral-100 rounded px-3 py-1.5">
              <span>
                {gol.jugador} ({nombreEquipo(gol.equipo_id)}){gol.minuto ? ` — ${gol.minuto}'` : ""}
              </span>
              <button onClick={() => startTransition(() => { eliminarGol(partidoId, gol.id); })} className="text-red-600 text-xs hover:underline">
                Quitar
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-white border border-neutral-200 rounded-lg p-4 flex flex-col gap-3">
        <h2 className="font-semibold">Tarjetas</h2>
        <form
          action={(formData) => startTransition(() => { agregarTarjeta(partidoId, formData); })}
          className="flex flex-wrap items-end gap-2 text-sm"
        >
          <select name="equipo_id" required className="border border-neutral-300 rounded px-2 py-1">
            {equipos.map((e) => (
              <option key={e.id} value={e.id}>{e.nombre}</option>
            ))}
          </select>
          <input name="jugador" placeholder="Jugador" required className="border border-neutral-300 rounded px-2 py-1" />
          <select name="tipo" className="border border-neutral-300 rounded px-2 py-1">
            <option value="amarilla">Amarilla</option>
            <option value="roja">Roja</option>
          </select>
          <input type="number" name="minuto" placeholder="Min" className="border border-neutral-300 rounded px-2 py-1 w-16" />
          <input name="motivo" placeholder="Motivo (opcional)" className="border border-neutral-300 rounded px-2 py-1" />
          <button type="submit" disabled={isPending} className="bg-dorado hover:bg-dorado-oscuro text-white rounded px-3 py-1.5 disabled:opacity-50">
            Agregar tarjeta
          </button>
        </form>
        <ul className="flex flex-col gap-1 text-sm">
          {tarjetas.map((tarjeta) => (
            <li key={tarjeta.id} className="flex items-center justify-between border border-neutral-100 rounded px-3 py-1.5">
              <span>
                {tarjeta.tipo === "roja" ? "🟥" : "🟨"} {tarjeta.jugador} ({nombreEquipo(tarjeta.equipo_id)})
                {tarjeta.minuto ? ` — ${tarjeta.minuto}'` : ""}
              </span>
              <button onClick={() => startTransition(() => { eliminarTarjeta(partidoId, tarjeta.id); })} className="text-red-600 text-xs hover:underline">
                Quitar
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-white border border-neutral-200 rounded-lg p-4 flex flex-col gap-3">
        <h2 className="font-semibold">Planillas de partido</h2>
        <p className="text-xs text-neutral-500">
          Se sube una planilla por equipo (formato COMET/AFA). Por ahora quedan guardadas para revisión manual —
          la lectura automática se conecta más adelante.
        </p>
        {equipos.map((equipo) => {
          const planilla = planillaDe(equipo.id);
          return (
            <div key={equipo.id} className="flex items-center gap-3">
              <span className="w-40 text-sm">{equipo.nombre}</span>
              {planilla ? (
                <span className="text-sm text-green-700">Planilla subida ✓</span>
              ) : (
                <PdfUploader
                  path={`partidos/${partidoId}/${equipo.id}.pdf`}
                  label=""
                  onUploaded={(path) => guardarPlanilla(partidoId, equipo.id, path)}
                />
              )}
            </div>
          );
        })}
      </section>
    </div>
  );
}

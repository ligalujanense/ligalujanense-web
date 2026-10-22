import type { ReactNode } from "react";
import { diaCorto } from "@/lib/dias";
import {
  RONDA_LABEL,
  marcadorLocalVisitante,
  type ClubFF,
  type CruceResuelto,
} from "@/lib/fase-final";

const ALTO_FILA = 176;
const ANCHO = 230;
const CONECTOR = 30;

function Escudo({ club }: { club: ClubFF | null }) {
  return club?.logo_url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={club.logo_url} alt="" className="h-6 w-6 shrink-0 object-contain" />
  ) : (
    <span className="h-6 w-6 shrink-0 rounded-full bg-celeste/10" />
  );
}

function FilaClub({
  club,
  etiqueta,
  goles,
  gano,
  perdio,
}: {
  club: ClubFF | null;
  etiqueta: string;
  goles: number | null;
  gano: boolean;
  perdio: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 ${
        gano ? "bg-dorado/15 font-bold text-dorado-oscuro" : perdio ? "text-neutral-400" : ""
      }`}
    >
      <Escudo club={club} />
      <span className={`flex-1 truncate ${club ? "" : "italic text-neutral-400"}`}>
        {club ? club.nombre : etiqueta}
      </span>
      {goles !== null && <span className="tabular-nums font-bold">{goles}</span>}
    </div>
  );
}

export function TarjetaCruce({ c }: { c: CruceResuelto }) {
  const gA = c.ganador && c.a && c.ganador.id === c.a.id;
  const gB = c.ganador && c.b && c.ganador.id === c.b.id;

  return (
    <div className="w-full rounded-lg border border-neutral-200 bg-white text-xs shadow-sm">
      <div className="flex items-center justify-between border-b border-neutral-100 px-3 py-1 text-[10px] uppercase tracking-wider text-neutral-400">
        <span>
          {RONDA_LABEL[c.ronda]} · {c.codigo.toUpperCase()}
        </span>
        <span>{c.formato === "unico" ? "Único" : "Global"}</span>
      </div>
      <FilaClub club={c.a} etiqueta={c.etiquetaA} goles={c.golesA} gano={!!gA} perdio={!!gB} />
      <div className="border-t border-neutral-100" />
      <FilaClub club={c.b} etiqueta={c.etiquetaB} goles={c.golesB} gano={!!gB} perdio={!!gA} />

      {c.porPenales && (
        <p className="border-t border-neutral-100 px-3 py-1 text-[11px] text-neutral-500">
          Penales {c.penales_a} - {c.penales_b}
        </p>
      )}
      {c.pendientePenales && (
        <p className="border-t border-neutral-100 px-3 py-1 text-[11px] font-semibold text-dorado-oscuro">
          Empate: se define por penales
        </p>
      )}

      <div className="border-t border-neutral-100 px-3 py-1.5 text-[11px] leading-snug text-neutral-500">
        {c.partidos.length === 0 && <p>Fecha a confirmar</p>}
        {c.partidos.map((p) => {
          const m = marcadorLocalVisitante(p);
          return (
            <p key={p.id} className="truncate">
              <span className="font-semibold text-neutral-600">
                {p.tipo === "ida" ? "Ida" : p.tipo === "vuelta" ? "Vuelta" : "Partido"}
              </span>{" "}
              {diaCorto(p.fecha) ?? "a definir"}
              {p.hora ? ` · ${p.hora.slice(0, 5)}` : ""}
              {p.estadio ? ` · ${p.estadio}` : ""}
              {m ? ` · ${m.local}-${m.visitante}` : ""}
            </p>
          );
        })}
      </div>
    </div>
  );
}

/** Línea horizontal que une una tarjeta con la siguiente columna. */
function LineaRecta() {
  return (
    <div className="relative h-full w-full">
      <div className="absolute left-0 right-0 top-1/2 border-t-2 border-neutral-300" />
    </div>
  );
}

/** Llave "]" que junta dos tarjetas (a 25% y 75% de alto) y sale al centro. */
function Llave() {
  return (
    <div className="relative h-full w-full">
      <div className="absolute bottom-1/4 left-0 right-1/2 top-1/4 border-b-2 border-r-2 border-t-2 border-neutral-300" />
      <div className="absolute left-1/2 right-0 top-1/2 border-t-2 border-neutral-300" />
    </div>
  );
}

function Celda({
  col,
  fila,
  span = 1,
  children,
}: {
  col: number;
  fila: number;
  span?: number;
  children: ReactNode;
}) {
  return (
    <div
      className="flex items-center"
      style={{ gridColumn: col, gridRow: `${fila} / span ${span}` }}
    >
      {children}
    </div>
  );
}

export function CuadroFaseFinal({ cruces }: { cruces: CruceResuelto[] }) {
  const de = (ronda: string) =>
    cruces.filter((c) => c.ronda === ronda).sort((x, y) => x.orden - y.orden);
  const finalAnual = de("final_anual")[0];
  const fase1 = de("fase1");
  const fase2 = de("fase2");
  const semis = de("semifinal");
  const final = de("final")[0];

  const columnas = `${ANCHO}px ${CONECTOR}px ${ANCHO}px ${CONECTOR}px ${ANCHO}px ${CONECTOR}px ${ANCHO}px`;
  const anchoTotal = ANCHO * 4 + CONECTOR * 3;
  const filas = Math.max(fase1.length, fase2.length, 1);

  return (
    <div className="flex flex-col gap-8">
      {finalAnual && (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-dorado-oscuro">
            Final Anual
          </h2>
          <div style={{ width: ANCHO }}>
            <TarjetaCruce c={finalAnual} />
          </div>
        </section>
      )}

      <div className="overflow-x-auto pb-2">
        <div style={{ minWidth: anchoTotal }}>
          <div className="mb-2 grid text-center text-xs font-bold uppercase tracking-wider text-celeste-oscuro" style={{ gridTemplateColumns: columnas }}>
            <span>1ª Fase</span>
            <span />
            <span>2ª Fase</span>
            <span />
            <span>Semifinal</span>
            <span />
            <span>Final</span>
          </div>

          <div
            className="grid"
            style={{ gridTemplateColumns: columnas, gridAutoRows: ALTO_FILA }}
          >
            {fase1.map((c, i) => (
              <Celda key={c.id} col={1} fila={i + 1}>
                <TarjetaCruce c={c} />
              </Celda>
            ))}
            {fase1.map((c, i) => (
              <Celda key={`l1-${c.id}`} col={2} fila={i + 1}>
                <LineaRecta />
              </Celda>
            ))}

            {fase2.map((c, i) => (
              <Celda key={c.id} col={3} fila={i + 1}>
                <TarjetaCruce c={c} />
              </Celda>
            ))}
            {Array.from({ length: Math.floor(filas / 2) }).map((_, i) => (
              <Celda key={`l2-${i}`} col={4} fila={i * 2 + 1} span={2}>
                <Llave />
              </Celda>
            ))}

            {semis.map((c, i) => (
              <Celda key={c.id} col={5} fila={i * 2 + 1} span={2}>
                <TarjetaCruce c={c} />
              </Celda>
            ))}
            {semis.length > 1 && (
              <Celda col={6} fila={1} span={filas}>
                <Llave />
              </Celda>
            )}

            {final && (
              <Celda col={7} fila={1} span={filas}>
                <TarjetaCruce c={final} />
              </Celda>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

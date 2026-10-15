"use client";

import { useRef, useState } from "react";

/**
 * Elige qué parte de la foto se ve en la imagen para compartir (formato historia
 * 9:16). Muestra la foto entera con un marco de bordes bien visibles: lo de
 * adentro se ve limpio (es lo que va a salir) y lo de afuera se oscurece.
 * Se arrastra el marco (o se usan los deslizadores).
 * Solo afecta esa imagen: en la web la foto sigue ocupando todo el espacio.
 * Guarda dos porcentajes (foco_x / foco_y) en campos ocultos del formulario.
 */
export function EncuadreHistoria({
  imagenUrl,
  x,
  y,
  onChange,
}: {
  imagenUrl: string;
  x: number;
  y: number;
  onChange: (x: number, y: number) => void;
}) {
  const [medidas, setMedidas] = useState<{ w: number; h: number } | null>(null);
  const caja = useRef<HTMLDivElement>(null);
  const arrastrando = useRef<{ px: number; py: number; x: number; y: number } | null>(null);

  if (!imagenUrl) return null;

  // Fracción de la foto que entra en 9:16 (misma cuenta que el generador de la imagen).
  const objetivo = 9 / 16;
  const aspecto = medidas ? medidas.w / medidas.h : 16 / 9;
  const vw = aspecto > objetivo ? Math.min(1, objetivo / aspecto) : 1;
  const vh = aspecto > objetivo ? 1 : Math.min(1, aspecto / objetivo);
  const sobraX = 1 - vw;
  const sobraY = 1 - vh;

  const marco = {
    left: `${sobraX * x}%`,
    top: `${sobraY * y}%`,
    width: `${vw * 100}%`,
    height: `${vh * 100}%`,
  };

  function mover(e: React.PointerEvent) {
    const a = arrastrando.current;
    const r = caja.current?.getBoundingClientRect();
    if (!a || !r) return;
    // Píxeles movidos -> porcentaje del recorrido posible del marco.
    const nx = sobraX > 0 ? a.x + ((e.clientX - a.px) / (r.width * sobraX)) * 100 : 50;
    const ny = sobraY > 0 ? a.y + ((e.clientY - a.py) / (r.height * sobraY)) * 100 : 50;
    onChange(
      Math.round(Math.min(100, Math.max(0, nx))),
      Math.round(Math.min(100, Math.max(0, ny)))
    );
  }

  const esquina = "absolute h-4 w-4 border-dorado";

  return (
    <div className="flex flex-col gap-2 text-sm">
      <span>Encuadre para compartir (historias, WhatsApp)</span>
      <p className="text-xs text-neutral-500">
        Lo que queda adentro de las líneas es lo que se va a mostrar. Arrastrá el recuadro sobre
        la foto o usá los deslizadores.
      </p>

      <div
        ref={caja}
        className="relative w-full max-w-md select-none overflow-hidden rounded-lg border border-neutral-300 bg-neutral-900"
        style={{ touchAction: "none" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imagenUrl}
          alt=""
          draggable={false}
          className="block w-full"
          onLoad={(e) =>
            setMedidas({
              w: e.currentTarget.naturalWidth,
              h: e.currentTarget.naturalHeight,
            })
          }
        />
        {/* Marco: interior vacío, bordes visibles; la sombra gigante oscurece solo lo de afuera. */}
        <div
          className="absolute cursor-move"
          style={{
            ...marco,
            border: "3px solid #ffffff",
            outline: "1px solid rgba(0,0,0,0.6)",
            boxShadow: "0 0 0 9999px rgba(0,0,0,0.65)",
          }}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            arrastrando.current = { px: e.clientX, py: e.clientY, x, y };
          }}
          onPointerMove={mover}
          onPointerUp={() => (arrastrando.current = null)}
          onPointerCancel={() => (arrastrando.current = null)}
        >
          <span className={`${esquina} -left-[3px] -top-[3px] border-l-4 border-t-4`} />
          <span className={`${esquina} -right-[3px] -top-[3px] border-r-4 border-t-4`} />
          <span className={`${esquina} -bottom-[3px] -left-[3px] border-b-4 border-l-4`} />
          <span className={`${esquina} -bottom-[3px] -right-[3px] border-b-4 border-r-4`} />
        </div>
      </div>

      <div className="flex max-w-md flex-col gap-3">
        {sobraX > 0 && (
          <label className="flex flex-col gap-1 text-xs text-neutral-600">
            Mover a izquierda / derecha
            <input
              type="range"
              min={0}
              max={100}
              value={x}
              onChange={(e) => onChange(Number(e.target.value), y)}
            />
          </label>
        )}
        {sobraY > 0 && (
          <label className="flex flex-col gap-1 text-xs text-neutral-600">
            Mover arriba / abajo
            <input
              type="range"
              min={0}
              max={100}
              value={y}
              onChange={(e) => onChange(x, Number(e.target.value))}
            />
          </label>
        )}
        <button
          type="button"
          onClick={() => onChange(50, 50)}
          className="self-start text-xs text-celeste-oscuro hover:underline"
        >
          Centrar
        </button>
      </div>
      <input type="hidden" name="foco_x" value={x} />
      <input type="hidden" name="foco_y" value={y} />
    </div>
  );
}

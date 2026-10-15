"use client";

/**
 * Elige qué parte de la foto se ve en la imagen para compartir (formato historia
 * 9:16). Solo afecta esa imagen: en la web la foto sigue ocupando todo el espacio.
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
  if (!imagenUrl) return null;

  return (
    <div className="flex flex-col gap-2 text-sm">
      <span>Encuadre para compartir (historias, WhatsApp)</span>
      <div className="flex items-start gap-4">
        <div
          className="relative shrink-0 overflow-hidden rounded-lg border border-neutral-300 bg-neutral-900"
          style={{ width: 126, height: 224 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imagenUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: `${x}% ${y}%` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/60" />
        </div>
        <div className="flex flex-1 flex-col gap-3">
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
          <button
            type="button"
            onClick={() => onChange(50, 50)}
            className="self-start text-xs text-celeste-oscuro hover:underline"
          >
            Centrar
          </button>
        </div>
      </div>
      <input type="hidden" name="foco_x" value={x} />
      <input type="hidden" name="foco_y" value={y} />
    </div>
  );
}

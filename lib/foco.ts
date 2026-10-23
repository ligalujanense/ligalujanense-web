/** Valor CSS de object-position a partir del punto de foco guardado (0-100, 50 = centro). */
export function posicionFoto(x?: number | null, y?: number | null): string {
  return `${x ?? 50}% ${y ?? 50}%`;
}

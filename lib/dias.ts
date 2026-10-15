/**
 * Formatea un día guardado como "YYYY-MM-DD" (columna `date`) sin que el huso
 * horario del servidor lo corra un día.
 */
function aFecha(iso: string): Date {
  return new Date(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)) - 1, Number(iso.slice(8, 10)));
}

/** "Sábado 12 de septiembre" */
export function diaLargo(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const texto = aFecha(iso)
    .toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })
    .replace(",", "");
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/** "Sáb 12/09" */
export function diaCorto(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = aFecha(iso);
  const dia = d
    .toLocaleDateString("es-AR", { weekday: "short" })
    .replace(".", "");
  const nombre = dia.charAt(0).toUpperCase() + dia.slice(1);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${nombre} ${dd}/${mm}`;
}

/** Para los diseños grandes: { semana: "SÁBADO", resto: "17.10.2026" } */
export function diaPartes(
  iso: string | null | undefined
): { semana: string; resto: string } | null {
  if (!iso) return null;
  const d = aFecha(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return {
    semana: d.toLocaleDateString("es-AR", { weekday: "long" }).toUpperCase(),
    resto: `${dd}.${mm}.${d.getFullYear()}`,
  };
}

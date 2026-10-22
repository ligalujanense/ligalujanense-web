/** Nombre abreviado para espacios chicos (imagen circular de la fase final). */
const ESPECIALES: Record<string, string> = {
  "Asociación Cristiana de Fútbol Argentino": "ACFA",
  "Orientacion Juvenil Club": "Orientación Juvenil",
  "Orientación Juvenil Club": "Orientación Juvenil",
  "URK C Bolivia D": "URK Bolivia",
  "Nacion Futbol": "Nación",
  "C.D Restauración FC": "CD Restauración",
};

export function clubCorto(nombre: string): string {
  const e = ESPECIALES[nombre];
  if (e) return e;
  const n = nombre
    .replace(/^Deportivo /, "Dep. ")
    .replace(/^General /, "Gral. ")
    .replace(/^Barrio /, "B. ")
    .replace(/ Club$/, "");
  return n.length > 20 ? `${n.slice(0, 19)}…` : n;
}

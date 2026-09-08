// Categorías dentro de "Torneos". Para sumar Fútbol Femenino o Categorías
// Formativas más adelante alcanza con agregar una entrada acá (con sus
// temporadas) y crear zonas en Supabase con ese mismo "categoria" (slug) —
// no hace falta tocar rutas ni el resto del código.
export type CategoriaTorneo = {
  slug: string;
  label: string;
  temporadas: string[];
};

export const CATEGORIAS_TORNEO: CategoriaTorneo[] = [
  {
    slug: "futbol-masculino",
    label: "Fútbol Masculino",
    temporadas: ["2026", "2027"],
  },
];

export function encontrarCategoria(slug: string) {
  return CATEGORIAS_TORNEO.find((c) => c.slug === slug) ?? null;
}

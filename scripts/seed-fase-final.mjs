// Carga el cuadro de la fase final 2026 (datos de los Excel "CRUCES 1, 2 y FINALES").
// Requiere haber corrido supabase/fase-final.sql. Uso:  node scripts/seed-fase-final.mjs
// Si ya hay cruces cargados no hace nada (para no pisar resultados).
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const CATEGORIA = "futbol-masculino";
const TEMPORADA = "2026";

// Nombre en el Excel -> nombre del club en la base.
const CLUB = {
  AVELLANEDA: "Orientacion Juvenil Club",
  ACFA: "Asociación Cristiana de Fútbol Argentino",
  BOLIVIA: "URK C Bolivia D",
  BALCARCE: "General Balcarce",
  A_MORENO: "Altos de Moreno",
  CDR: "C.D Restauración FC",
  CORINA: "Villa Corina",
  NACION: "Nacion Futbol",
  VENEZOLANO: "Deportivo Venezolano",
  MORENO_FC: "Moreno FC",
  INDEPENDENCIA: "Barrio Independencia",
  BONGIOVANNI: "Deportivo Bongiovanni",
  GUARANI: "Deportivo Guaraní",
};

const y = (d) => `2026-${d.split(".")[1]}-${d.split(".")[0]}`; // "24.10" -> 2026-10-24

// ida/vuelta: [dia, hora, estadio]
const CRUCES = [
  { codigo: "FA", ronda: "final_anual", orden: 1, a: "AVELLANEDA", b: "ACFA",
    ida: ["24.10", "11:00", "D. CABRERA"], vuelta: ["31.10", null, null] },

  { codigo: "1", ronda: "fase1", orden: 1, a: "BOLIVIA", b: "BALCARCE",
    ida: ["24.10", "15:00", "DEF. MORENO"], vuelta: ["31.10", null, "BALCARCE"] },
  { codigo: "4", ronda: "fase1", orden: 2, a: "VENEZOLANO", b: "MORENO_FC",
    ida: ["24.10", "15:00", "BALCARCE"], vuelta: ["31.10", null, "DEF. MORENO"] },
  { codigo: "3", ronda: "fase1", orden: 3, a: "CORINA", b: "NACION",
    ida: ["25.10", "15:00", "MARADONA"], vuelta: ["31.10", null, "DEF. MORENO"] },
  { codigo: "2", ronda: "fase1", orden: 4, a: "A_MORENO", b: "CDR",
    ida: ["24.10", "17:00", "DEF. MORENO"], vuelta: ["31.10", null, "BALCARCE"] },

  { codigo: "b", ronda: "fase2", orden: 1, a: "INDEPENDENCIA", origenB: "G:1",
    ida: ["07.11", null, "INDEPENDENCIA"], vuelta: ["14.11", null, null] },
  { codigo: "a", ronda: "fase2", orden: 2, origenA: "G:4", origenB: "P:FA",
    ida: ["07.11", null, null], vuelta: ["14.11", null, null] },
  { codigo: "d", ronda: "fase2", orden: 3, origenA: "G:3", b: "GUARANI",
    ida: ["07.11", null, null], vuelta: ["14.11", null, "SEMILLERO"] },
  { codigo: "c", ronda: "fase2", orden: 4, a: "BONGIOVANNI", origenB: "G:2",
    ida: ["07.11", null, "DEF. MORENO"], vuelta: ["14.11", null, null] },

  { codigo: "X", ronda: "semifinal", orden: 1, origenA: "G:b", origenB: "G:a",
    ida: ["21.11", null, null], vuelta: ["28.11", null, null] },
  { codigo: "Y", ronda: "semifinal", orden: 2, origenA: "G:d", origenB: "G:c",
    ida: ["21.11", null, null], vuelta: ["28.11", null, null] },

  { codigo: "F", ronda: "final", orden: 1, formato: "unico", origenA: "G:Y", origenB: "G:X",
    unico: ["05.12", null, null] },
];

const { data: existentes } = await sb
  .from("fase_final_cruces").select("id").eq("categoria", CATEGORIA).eq("temporada", TEMPORADA);
if (existentes?.length) {
  console.log(`Ya hay ${existentes.length} cruces cargados: no se toca nada.`);
  process.exit(0);
}

const { data: clubes } = await sb.from("clubes").select("id, nombre");
const idDe = (clave) => {
  const nombre = CLUB[clave];
  const c = clubes.find((k) => k.nombre === nombre);
  if (!c) throw new Error(`No encuentro el club "${nombre}" (${clave}) en la base`);
  return c.id;
};

for (const c of CRUCES) {
  const { data: cruce, error } = await sb
    .from("fase_final_cruces")
    .insert({
      categoria: CATEGORIA,
      temporada: TEMPORADA,
      ronda: c.ronda,
      codigo: c.codigo,
      orden: c.orden,
      formato: c.formato ?? "ida_vuelta",
      club_a_id: c.a ? idDe(c.a) : null,
      club_b_id: c.b ? idDe(c.b) : null,
      origen_a: c.origenA ?? null,
      origen_b: c.origenB ?? null,
    })
    .select("id")
    .single();
  if (error) throw error;

  const partidos = [["ida", c.ida], ["vuelta", c.vuelta], ["unico", c.unico]]
    .filter(([, v]) => v)
    .map(([tipo, [dia, hora, estadio]]) => ({
      cruce_id: cruce.id, tipo, fecha: y(dia), hora, estadio,
    }));
  const { error: e2 } = await sb.from("fase_final_partidos").insert(partidos);
  if (e2) throw e2;
  console.log(`cruce ${c.codigo} (${c.ronda}) cargado`);
}
console.log("Listo.");

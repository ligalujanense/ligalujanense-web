// Carga el reporte "Goleadores" de COMET (texto copiado del PDF) en una zona o en la fase final.
// Reemplaza la lista completa de ese ámbito (los totales de COMET son acumulados).
//
//   node scripts/importar-comet.mjs "Zona Oeste" 2026 ruta/al/texto.txt
//   node scripts/importar-comet.mjs fase-final 2026 ruta/al/texto.txt
//
// Requiere haber corrido supabase/goleadores.sql. También se puede hacer desde el admin (Goleadores).
import { readFileSync } from "node:fs";
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import ts from "typescript";

config({ path: ".env.local" });
const [ambito, temporada, archivo] = process.argv.slice(2);
if (!ambito || !temporada || !archivo) {
  console.log('Uso: node scripts/importar-comet.mjs "Zona Oeste" 2026 texto.txt');
  process.exit(1);
}

// lib/goleadores.ts es TypeScript sin dependencias: se transpila al vuelo.
const js = ts.transpileModule(readFileSync("lib/goleadores.ts", "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const mod = { exports: {} };
new Function("module", "exports", js)(mod, mod.exports);
const { parsearComet, emparejarClub, normalizar } = mod.exports;

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

let zonaId = null;
const categoria = "futbol-masculino";
if (ambito !== "fase-final") {
  const { data: zona } = await sb
    .from("zonas").select("id").eq("nombre", ambito).eq("temporada", temporada).eq("categoria", categoria).single();
  if (!zona) throw new Error(`No encuentro la zona "${ambito}" ${temporada}`);
  zonaId = zona.id;
}

const r = parsearComet(readFileSync(archivo, "utf8"));
if (r.filas.length === 0) throw new Error("No encontré jugadores en el archivo");
const { data: clubes } = await sb.from("clubes").select("id, nombre");

const mapa = new Map();
for (const f of r.filas) {
  const club = emparejarClub(f.club, clubes);
  const clave = `${normalizar(f.jugador)}|${normalizar(f.club)}`;
  const e = mapa.get(clave);
  if (e) e.goles += f.goles;
  else mapa.set(clave, { jugador: f.jugador, club_nombre: f.club, club_id: club?.id ?? null, goles: f.goles });
}

let borrar = sb.from("goleadores").delete().eq("categoria", categoria).eq("temporada", temporada);
borrar = zonaId ? borrar.eq("zona_id", zonaId) : borrar.is("zona_id", null);
const { error: eDel } = await borrar;
if (eDel) throw eDel;

const filas = [...mapa.values()].map((f) => ({ ...f, categoria, temporada, zona_id: zonaId }));
const { error } = await sb.from("goleadores").insert(filas);
if (error) throw error;

const sinClub = [...new Set(filas.filter((f) => !f.club_id).map((f) => f.club_nombre))];
console.log(`${ambito} ${temporada}: ${filas.length} jugadores, ${filas.reduce((s, f) => s + f.goles, 0)} goles cargados.`);
if (r.autogoles.length) console.log("Goles en contra (no se cargan):", r.autogoles.map((a) => `${a.jugador} (${a.club})`).join(", "));
if (sinClub.length) console.log("Clubes que no están en la tabla clubes (se cargan sin escudo):", sinClub.join(", "));

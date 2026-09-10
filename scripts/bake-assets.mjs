// Descarga los logos (escudo de la liga, sponsors, escudos de clubes) desde
// Supabase, los optimiza y los deja embebidos como data URIs en
// lib/baked-assets.generated.ts. Ese archivo lo usa la ruta que genera la
// imagen de la fecha para compartir en redes: next/og en Cloudflare Workers
// no puede traer imágenes por fetch en tiempo de ejecución, tienen que venir
// embebidas.
//
// Reejecutar con `npm run bake` cuando cambien logos de sponsors o de clubes,
// y volver a commitear el archivo generado.

import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import fs from "node:fs";

const env = Object.fromEntries(
  fs
    .readFileSync(".env.local", "utf8")
    .split("\n")
    .filter((l) => l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

// PNG con paleta (colores reducidos) para que el data URI pese lo menos posible:
// el módulo generado se carga entero en cada arranque del Worker.
async function bufADataUri(input, width) {
  const out = await sharp(input)
    .resize({ width, withoutEnlargement: true })
    .png({ compressionLevel: 9, palette: true, quality: 78 })
    .toBuffer();
  return `data:image/png;base64,${out.toString("base64")}`;
}

async function urlADataUri(url, width) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await bufADataUri(Buffer.from(await res.arrayBuffer()), width);
  } catch (e) {
    console.warn("  no se pudo procesar", url, e.message);
    return null;
  }
}

const LIGA_LOGO = await bufADataUri("public/logo.png", 190);

const { data: sponsorsRaw } = await supabase
  .from("sponsors")
  .select("id, nombre, logo_url, fila, orden")
  .order("orden");

const sponsors = [];
for (const s of sponsorsRaw ?? []) {
  sponsors.push({
    nombre: s.nombre,
    fila: s.fila ?? 1,
    orden: s.orden ?? 0,
    dataUri: s.logo_url ? await urlADataUri(s.logo_url, 200) : null,
  });
}

const { data: clubesRaw } = await supabase
  .from("clubes")
  .select("id, nombre, logo_url");

const clubLogos = {};
for (const c of clubesRaw ?? []) {
  if (!c.logo_url) continue;
  const d = await urlADataUri(c.logo_url, 120);
  if (d) clubLogos[c.id] = d;
}

const contenido = `// GENERADO por scripts/bake-assets.mjs — no editar a mano.
// Reejecutar con \`npm run bake\` cuando cambien logos de sponsors o clubes.

export const LIGA_LOGO = ${JSON.stringify(LIGA_LOGO)};

export type SponsorBaked = {
  nombre: string;
  fila: number;
  orden: number;
  dataUri: string | null;
};

export const SPONSORS_BAKED: SponsorBaked[] = ${JSON.stringify(sponsors)};

export const CLUB_LOGOS: Record<string, string> = ${JSON.stringify(clubLogos)};
`;

fs.writeFileSync("lib/baked-assets.generated.ts", contenido);
console.log(
  `baked: escudo liga + ${sponsors.length} sponsors + ${Object.keys(clubLogos).length} escudos de clubes`
);

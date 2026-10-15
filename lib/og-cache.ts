import { createAdminClient } from "@/lib/supabase/admin";

const BUCKET = "imagenes";

// Cada deploy puede traer cambios de diseño, sponsors o escudos (npm run bake):
// el commit entra en la huella, así una imagen vieja nunca se sirve tras un deploy.
const DEPLOY = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12);

function hashCorto(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h.toString(36);
}

/**
 * Dibuja una imagen de compartir UNA sola vez por versión de los datos.
 *
 * La huella de `datos` (todo lo que se ve en la imagen) define el archivo en
 * Supabase Storage `og/<carpeta>/<clave>-<huella>.png`:
 *  - si ya existe, se devuelve sin dibujar nada (rápido y barato);
 *  - si no, se dibuja, se guarda y se borran las versiones anteriores de esa clave.
 * Así miles de pedidos (o un bot pidiendo con direcciones distintas) no vuelven a
 * renderizar: solo cuando cambia un resultado, una hora, un estadio, etc.
 *
 * En local (sin Vercel) no se guarda nada: se dibuja siempre, para ver los
 * cambios de diseño al instante sin ensuciar el Storage de producción.
 */
export async function imagenConCache(opciones: {
  carpeta: string;
  /** Identifica la imagen (ej. id de la fecha). Solo valores ya validados contra la base. */
  clave: string;
  datos: unknown;
  dibujar: () => Response;
  cacheControl: string;
}): Promise<Response> {
  const { carpeta, clave, datos, dibujar, cacheControl } = opciones;
  const headers = { "Content-Type": "image/png", "Cache-Control": cacheControl };

  if (!DEPLOY) return new Response(await dibujar().arrayBuffer(), { headers });

  const huella = hashCorto(`${DEPLOY}|${JSON.stringify(datos)}`);
  const nombre = `${clave}-${huella}.png`;
  const path = `og/${carpeta}/${nombre}`;
  const supabase = createAdminClient();

  const { data: guardada } = await supabase.storage.from(BUCKET).download(path);
  if (guardada) return new Response(guardada, { headers });

  const buf = await dibujar().arrayBuffer();
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, buf, { contentType: "image/png", upsert: true });

  if (!error) {
    // Limpieza: versiones anteriores de esta misma imagen.
    const { data: lista } = await supabase.storage
      .from(BUCKET)
      .list(`og/${carpeta}`, { search: `${clave}-`, limit: 100 });
    const viejas = (lista ?? [])
      .map((f) => f.name)
      .filter((n) => n !== nombre && n.startsWith(`${clave}-`) && /^[a-z0-9]+\.png$/.test(n.slice(clave.length + 1)))
      .map((n) => `og/${carpeta}/${n}`);
    if (viejas.length) await supabase.storage.from(BUCKET).remove(viejas);
  }

  return new Response(buf, { headers });
}

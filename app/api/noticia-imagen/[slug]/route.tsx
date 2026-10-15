import { ImageResponse } from "next/og";
import { createAdminClient } from "@/lib/supabase/admin";
import { LIGA_LOGO } from "@/lib/baked-assets.generated";
import { medidasImagen } from "@/lib/medidas-imagen";

const ANCHO = 1080;
const ALTO = 1920;

// Vercel: margen de tiempo para renderizar la imagen (el default son 10 s).
export const maxDuration = 30;

const BUCKET = "imagenes";
const OSCURO = "#0d1b24";
const DORADO = "#D9A441";

// Caché corta a propósito: la ruta es barata (devuelve el PNG ya guardado en Storage)
// y así un cambio de título, foto o encuadre se ve enseguida, sin quedar pegada una
// versión vieja en el navegador o en el CDN.
const CACHE = "public, max-age=0, s-maxage=30, must-revalidate";

// Subir este número cada vez que cambie el diseño del collage: cambia el nombre
// de los archivos guardados y todas las noticias se regeneran solas.
const VERSION_DISENO = "v1";

// Hash corto y estable del contenido: si cambia el título, la foto o el diseño,
// cambia el nombre del archivo guardado y se vuelve a generar en la próxima compartida.
function hashCorto(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h.toString(36);
}

async function fotoDataUri(
  url: string
): Promise<{ uri: string; medidas: { w: number; h: number } | null } | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(4500) });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.byteLength > 6_000_000) return null;
    const ct = res.headers.get("content-type") ?? "image/jpeg";
    return {
      uri: `data:${ct};base64,${buf.toString("base64")}`,
      medidas: medidasImagen(buf),
    };
  } catch {
    return null;
  }
}

/**
 * Posición de la foto para cubrir el lienzo mostrando la zona elegida.
 * (Satori ignora `object-position`, así que se calcula el desplazamiento a mano.)
 * Centrada o con medidas desconocidas -> recorte centrado normal.
 */
function ubicarFoto(
  medidas: { w: number; h: number } | null,
  fx: number,
  fy: number
): React.CSSProperties {
  if (!medidas || (fx === 50 && fy === 50)) {
    return { position: "absolute", inset: 0, objectFit: "cover" };
  }
  const escala = Math.max(ANCHO / medidas.w, ALTO / medidas.h);
  const dw = Math.round(medidas.w * escala);
  const dh = Math.round(medidas.h * escala);
  return {
    position: "absolute",
    width: dw,
    height: dh,
    left: -Math.round(((dw - ANCHO) * fx) / 100),
    top: -Math.round(((dh - ALTO) * fy) / 100),
  };
}

type Noticia = {
  titulo: string;
  imagen_url: string | null;
  created_at: string;
  foco_x: number;
  foco_y: number;
};

// `completo` es false cuando la noticia tiene foto pero no se pudo traer: en ese
// caso el collage sale sin foto y NO se guarda, para que se reintente la próxima vez.
async function generar(
  noticia: Noticia
): Promise<{ buf: ArrayBuffer; completo: boolean }> {
  const fondo = noticia.imagen_url ? await fotoDataUri(noticia.imagen_url) : null;
  const completo = !noticia.imagen_url || fondo !== null;
  let fecha = new Date(noticia.created_at).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  fecha = fecha.charAt(0).toUpperCase() + fecha.slice(1);
  const titulo = (noticia.titulo ?? "").slice(0, 170);

  const img = new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: OSCURO,
        }}
      >
        {fondo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={fondo.uri}
            style={ubicarFoto(fondo.medidas, noticia.foco_x, noticia.foco_y)}
            alt=""
          />
        )}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background:
              "linear-gradient(to top, rgba(13,27,36,0.97) 0%, rgba(13,27,36,0.15) 42%, rgba(13,27,36,0.72) 100%)",
          }}
        />

        <div
          style={{
            position: "absolute",
            top: 64,
            left: 60,
            display: "flex",
            alignItems: "center",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={LIGA_LOGO}
            width={78}
            height={86}
            style={{ objectFit: "contain", marginRight: 20 }}
            alt=""
          />
          <span
            style={{
              color: "#ffffff",
              fontSize: 30,
              fontWeight: 700,
              letterSpacing: 3,
              textTransform: "uppercase",
            }}
          >
            Liga Lujanense
          </span>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 108,
            left: 60,
            right: 60,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ display: "flex" }}>
            <span
              style={{
                background: DORADO,
                color: OSCURO,
                fontSize: 27,
                fontWeight: 800,
                letterSpacing: 3,
                padding: "12px 28px",
                borderRadius: 10,
                textTransform: "uppercase",
              }}
            >
              Noticia
            </span>
          </div>
          <span
            style={{
              color: "#ffffff",
              fontSize: 76,
              fontWeight: 800,
              lineHeight: 1.1,
              marginTop: 28,
            }}
          >
            {titulo}
          </span>
          <span
            style={{
              color: "rgba(255,255,255,0.62)",
              fontSize: 31,
              marginTop: 22,
              textTransform: "capitalize",
            }}
          >
            {fecha}
          </span>
        </div>
      </div>
    ),
    { width: 1080, height: 1920 }
  );

  return { buf: await img.arrayBuffer(), completo };
}

export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const supabase = createAdminClient();

  const { data: noticia } = await supabase
    .from("noticias")
    // "*" a propósito: si falta la columna del encuadre, igual se genera centrada.
    .select("*")
    .eq("slug", slug)
    .eq("publicado", true)
    .single();

  if (!noticia) return new Response("Noticia no encontrada", { status: 404 });

  // El encuadre entra en la huella solo si no es el centrado: así las imágenes
  // ya guardadas (centradas) no se regeneran.
  const fx = Number.isFinite(noticia.foco_x) ? Number(noticia.foco_x) : 50;
  const fy = Number.isFinite(noticia.foco_y) ? Number(noticia.foco_y) : 50;
  const encuadre = fx === 50 && fy === 50 ? "" : `|${fx},${fy}`;
  const version = hashCorto(
    `${VERSION_DISENO}|${noticia.titulo}|${noticia.imagen_url ?? ""}${encuadre}`
  );
  const path = `og/noticias/${slug}-${version}.png`;

  // 1) ¿ya está generada y guardada? -> se sirve sin dibujar nada.
  const { data: guardada } = await supabase.storage.from(BUCKET).download(path);
  if (guardada) {
    return new Response(guardada, {
      headers: { "Content-Type": "image/png", "Cache-Control": CACHE },
    });
  }

  // 2) primera vez -> se genera, se guarda en Supabase y se devuelve.
  const { buf, completo } = await generar({ ...(noticia as Noticia), foco_x: fx, foco_y: fy });
  if (completo) {
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, buf, { contentType: "image/png", upsert: true });

    // Limpieza: versiones anteriores de esta misma noticia.
    if (!error) {
      const nombre = `${slug}-${version}.png`;
      const { data: lista } = await supabase.storage
        .from(BUCKET)
        .list("og/noticias", { search: `${slug}-`, limit: 100 });
      const viejas = (lista ?? [])
        .map((f) => f.name)
        .filter((n) => n !== nombre && n.startsWith(`${slug}-`) && /^[a-z0-9]+\.png$/.test(n.slice(slug.length + 1)))
        .map((n) => `og/noticias/${n}`);
      if (viejas.length) await supabase.storage.from(BUCKET).remove(viejas);
    }
  }

  return new Response(buf, {
    headers: {
      "Content-Type": "image/png",
      // Si salió incompleta no se cachea en ningún lado.
      "Cache-Control": completo ? CACHE : "no-store",
    },
  });
}

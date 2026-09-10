import { ImageResponse } from "next/og";
import { createAdminClient } from "@/lib/supabase/admin";
import { LIGA_LOGO } from "@/lib/baked-assets.generated";

const BUCKET = "imagenes";
const OSCURO = "#0d1b24";
const DORADO = "#D9A441";

const CACHE = "public, max-age=3600, s-maxage=31536000";

// Hash corto y estable del contenido: si cambia el título o la foto, cambia el
// nombre del archivo guardado y se vuelve a generar en la próxima compartida.
function hashCorto(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h.toString(36);
}

async function fotoDataUri(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(4500) });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.byteLength > 1_600_000) return null;
    const ct = res.headers.get("content-type") ?? "image/jpeg";
    return `data:${ct};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

type Noticia = { titulo: string; imagen_url: string | null; created_at: string };

async function generar(noticia: Noticia): Promise<ArrayBuffer> {
  const fondo = noticia.imagen_url ? await fotoDataUri(noticia.imagen_url) : null;
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
            src={fondo}
            width={1080}
            height={1920}
            style={{ position: "absolute", inset: 0, objectFit: "cover" }}
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

  return img.arrayBuffer();
}

export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const supabase = createAdminClient();

  const { data: noticia } = await supabase
    .from("noticias")
    .select("titulo, imagen_url, created_at")
    .eq("slug", slug)
    .eq("publicado", true)
    .single();

  if (!noticia) return new Response("Noticia no encontrada", { status: 404 });

  const version = hashCorto(`${noticia.titulo}|${noticia.imagen_url ?? ""}`);
  const path = `og/noticias/${slug}-${version}.png`;

  // 1) ¿ya está generada y guardada? -> se sirve sin dibujar nada.
  const { data: guardada } = await supabase.storage.from(BUCKET).download(path);
  if (guardada) {
    return new Response(guardada, {
      headers: { "Content-Type": "image/png", "Cache-Control": CACHE },
    });
  }

  // 2) primera vez -> se genera, se guarda en Supabase y se devuelve.
  const buf = await generar(noticia as Noticia);
  await supabase.storage
    .from(BUCKET)
    .upload(path, buf, { contentType: "image/png", upsert: true });

  return new Response(buf, {
    headers: { "Content-Type": "image/png", "Cache-Control": CACHE },
  });
}

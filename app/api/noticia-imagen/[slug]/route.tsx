import { ImageResponse } from "next/og";
import { createAdminClient } from "@/lib/supabase/admin";
import { LIGA_LOGO } from "@/lib/baked-assets.generated";

const OSCURO = "#0d1b24";
const DORADO = "#D9A441";

const ALTO_FOTO = 1040; // la foto ocupa solo la franja superior (rasterizar la
// imagen completa a 1080x1920 supera el límite de CPU del Worker).

async function imagenADataUri(url: string): Promise<string | null> {
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

  const fondo = noticia.imagen_url ? await imagenADataUri(noticia.imagen_url) : null;

  const fecha = new Date(noticia.created_at).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const titulo = (noticia.titulo ?? "").slice(0, 170);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: OSCURO,
        }}
      >
        {/* Franja superior: foto (o color de marca si no hay) */}
        <div
          style={{
            width: 1080,
            height: ALTO_FOTO,
            display: "flex",
            position: "relative",
            background: "#123043",
          }}
        >
          {fondo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={fondo}
              width={1080}
              height={ALTO_FOTO}
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
                "linear-gradient(to bottom, rgba(13,27,36,0.55) 0%, rgba(13,27,36,0) 30%, rgba(13,27,36,0) 70%, rgba(13,27,36,1) 100%)",
            }}
          />
          {/* Encabezado */}
          <div
            style={{
              position: "absolute",
              top: 60,
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
        </div>

        {/* Panel inferior con el texto */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 64px",
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
              fontSize: 74,
              fontWeight: 800,
              lineHeight: 1.1,
              marginTop: 30,
            }}
          >
            {titulo}
          </span>
          <span
            style={{
              color: "rgba(255,255,255,0.6)",
              fontSize: 31,
              marginTop: 24,
              textTransform: "capitalize",
            }}
          >
            {fecha}
          </span>
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1920,
      headers: {
        // Contenido estable por noticia → se cachea fuerte en el borde: la
        // primera generación exitosa queda servida al instante para todos.
        "Cache-Control": "public, max-age=300, s-maxage=604800",
      },
    }
  );
}

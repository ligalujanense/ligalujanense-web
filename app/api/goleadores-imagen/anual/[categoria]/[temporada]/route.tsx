import { ImageResponse } from "next/og";
import { createAdminClient } from "@/lib/supabase/admin";
import { imagenConCache } from "@/lib/og-cache";
import { encontrarCategoria } from "@/lib/torneos";
import { goleadorAnualDeTemporada } from "@/lib/goleadores-data";
import { ImagenGoleadores, filasParaImagen } from "@/lib/og-goleadores";

export const maxDuration = 30;

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ categoria: string; temporada: string }> }
) {
  const { categoria, temporada } = await ctx.params;
  const cat = encontrarCategoria(categoria);
  if (!cat || !cat.temporadas.includes(temporada)) {
    return new Response("No encontrado", { status: 404 });
  }

  const { filas: todas } = await goleadorAnualDeTemporada(createAdminClient(), cat.slug, temporada);
  const filas = filasParaImagen(todas);
  if (filas.length === 0) return new Response("Sin goleadores", { status: 404 });

  return imagenConCache({
    carpeta: "goleadores",
    clave: `anual-${cat.slug}-${temporada}`,
    datos: { temporada, filas },
    cacheControl: "public, max-age=0, s-maxage=30, must-revalidate",
    dibujar: () =>
      new ImageResponse(
        (
          <ImagenGoleadores
            kicker="Goleador anual"
            titulo={temporada}
            subtitulo="Zonas y fase final"
            filas={filas}
          />
        ),
        { width: 1080, height: 1920 }
      ),
  });
}

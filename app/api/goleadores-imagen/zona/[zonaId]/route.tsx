import { ImageResponse } from "next/og";
import { createAdminClient } from "@/lib/supabase/admin";
import { imagenConCache } from "@/lib/og-cache";
import { goleadoresDeZona } from "@/lib/goleadores-data";
import { ImagenGoleadores, filasParaImagen } from "@/lib/og-goleadores";

export const maxDuration = 30;

export async function GET(_req: Request, ctx: { params: Promise<{ zonaId: string }> }) {
  const { zonaId } = await ctx.params;
  const supabase = createAdminClient();

  const { data: zona } = await supabase
    .from("zonas")
    .select("id, nombre, temporada")
    .eq("id", zonaId)
    .single();
  if (!zona) return new Response("Zona no encontrada", { status: 404 });

  const filas = filasParaImagen(await goleadoresDeZona(supabase, zonaId));
  if (filas.length === 0) return new Response("Sin goleadores", { status: 404 });

  return imagenConCache({
    carpeta: "goleadores",
    clave: `zona-${zona.id}`,
    datos: { zona: zona.nombre, temporada: zona.temporada, filas },
    cacheControl: "public, max-age=0, s-maxage=30, must-revalidate",
    dibujar: () =>
      new ImageResponse(
        (
          <ImagenGoleadores
            kicker={zona.nombre}
            titulo="Goleadores"
            subtitulo={`Temporada ${zona.temporada}`}
            filas={filas}
          />
        ),
        { width: 1080, height: 1920 }
      ),
  });
}

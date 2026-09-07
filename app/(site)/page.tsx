import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { HeroCarousel } from "@/components/site/HeroCarousel";
import { QuickLinks } from "@/components/site/QuickLinks";
import { MatchTicker } from "@/components/site/MatchTicker";
import { elegirFechaActiva, type TickerPartido } from "@/lib/match-ticker";

export default async function Home() {
  const supabase = await createClient();

  const [{ data: noticias }, { data: sponsors }, { data: zonas }] =
    await Promise.all([
      supabase
        .from("noticias")
        .select("id, titulo, slug, resumen, imagen_url, created_at")
        .eq("publicado", true)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase.from("sponsors").select("id, nombre, logo_url, url").order("orden"),
      supabase.from("zonas").select("id, nombre, temporada").order("nombre"),
    ]);

  const tickerPartidos: TickerPartido[] = [];

  if (zonas && zonas.length > 0) {
    const zonasConFechas = await Promise.all(
      zonas.map(async (zona) => {
        const { data: fechas } = await supabase
          .from("fixture_fechas")
          .select(
            `numero_fecha,
             partidos (
               id, estado, hora, resultado_local, resultado_visitante, libre_equipo_id,
               equipo_local:equipo_local_id ( clubes ( nombre ) ),
               equipo_visitante:equipo_visitante_id ( clubes ( nombre ) )
             )`
          )
          .eq("zona_id", zona.id)
          .order("numero_fecha");
        return { zona, fechas: fechas ?? [] };
      })
    );

    for (const { zona, fechas } of zonasConFechas) {
      const fechaActiva = elegirFechaActiva(fechas as any);
      if (!fechaActiva) continue;

      for (const partido of (fechaActiva as any).partidos ?? []) {
        if (partido.libre_equipo_id) continue;
        tickerPartidos.push({
          id: partido.id,
          zona: zona.nombre,
          local: partido.equipo_local?.clubes?.nombre ?? "?",
          visitante: partido.equipo_visitante?.clubes?.nombre ?? "?",
          estado: partido.estado,
          resultado_local: partido.resultado_local,
          resultado_visitante: partido.resultado_visitante,
          hora: partido.hora,
        });
      }
    }
  }

  return (
    <main className="flex flex-col">
      {noticias && noticias.length > 0 ? (
        <HeroCarousel noticias={noticias} />
      ) : (
        <section className="relative bg-gradient-to-b from-crema via-dorado-claro/25 to-dorado/20 overflow-hidden">
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "radial-gradient(circle at 12% 15%, #E8BE6B 0, transparent 45%), radial-gradient(circle at 90% 85%, #D9A441 0, transparent 40%)",
            }}
          />
          <div className="relative max-w-2xl mx-auto px-4 py-14 sm:py-20">
            <div className="bg-celeste-oscuro rounded-3xl px-8 py-12 shadow-2xl flex flex-col items-center gap-4 text-center">
              <div className="bg-white rounded-full p-4 shadow-lg">
                <Image src="/logo.png" alt="Liga Lujanense" width={96} height={106} className="h-20 w-auto" priority />
              </div>
              <span className="uppercase tracking-[0.2em] text-dorado-claro text-xs font-bold bg-white/10 px-3 py-1 rounded-full">
                Temporada 2026
              </span>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                Liga Lujanense de Fútbol
              </h1>
              <p className="text-white/80 max-w-xl font-medium">
                Noticias, fixture, tabla de posiciones y clubes afiliados de la liga.
              </p>
              <div className="flex flex-wrap gap-3 justify-center mt-2">
                <Link
                  href="/posiciones"
                  className="bg-dorado hover:bg-dorado-claro text-celeste-oscuro font-bold px-5 py-2.5 rounded-full transition-colors shadow-sm"
                >
                  Ver posiciones
                </Link>
                <Link
                  href="/fixture"
                  className="bg-white/10 hover:bg-white/20 text-white font-bold px-5 py-2.5 rounded-full transition-colors border border-white/20"
                >
                  Ver fixture
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      <MatchTicker partidos={tickerPartidos} />

      <QuickLinks />

      <div className="max-w-6xl mx-auto px-4 py-12 flex flex-col gap-14 w-full">
        {zonas && zonas.length > 0 && (
          <section className="flex flex-col gap-4">
            <h2 className="text-xl font-bold text-celeste-oscuro">Zonas</h2>
            <div className="flex flex-wrap gap-3">
              {zonas.map((zona) => (
                <Link
                  key={zona.id}
                  href={`/posiciones/${zona.id}`}
                  className="group bg-white border border-neutral-200 rounded-xl px-5 py-4 hover:border-dorado hover:shadow-md transition-all min-w-[160px]"
                >
                  <p className="font-bold text-celeste-oscuro group-hover:text-dorado-oscuro transition-colors">
                    {zona.nombre}
                  </p>
                  <p className="text-sm text-neutral-500">{zona.temporada}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-celeste-oscuro">Últimas noticias</h2>
            <Link href="/noticias" className="text-sm font-semibold text-dorado-oscuro hover:underline">
              Ver todas →
            </Link>
          </div>
          {noticias && noticias.length > 0 ? (
            <div className="grid sm:grid-cols-3 gap-5">
              {noticias.slice(0, 3).map((noticia) => (
                <Link
                  key={noticia.id}
                  href={`/noticias/${noticia.slug}`}
                  className="group flex flex-col bg-white border border-neutral-200 rounded-xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all"
                >
                  {noticia.imagen_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={noticia.imagen_url} alt="" className="h-32 w-full object-cover" />
                  ) : (
                    <div className="h-32 bg-gradient-to-br from-dorado-oscuro to-dorado flex items-center justify-center">
                      <span className="text-white font-black text-xs uppercase tracking-widest">
                        Liga Lujanense
                      </span>
                    </div>
                  )}
                  <div className="p-4 flex flex-col gap-1">
                    <p className="font-bold text-celeste-oscuro group-hover:text-dorado-oscuro transition-colors line-clamp-2">
                      {noticia.titulo}
                    </p>
                    {noticia.resumen && (
                      <p className="text-sm text-neutral-500 line-clamp-2">{noticia.resumen}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-neutral-500 text-sm">Todavía no hay noticias publicadas.</p>
          )}
        </section>

        {sponsors && sponsors.length > 0 && (
          <section className="flex flex-col gap-4">
            <h2 className="text-xl font-bold text-celeste-oscuro">Sponsors</h2>
            <div className="flex flex-wrap items-center gap-6 bg-white border border-neutral-200 rounded-xl px-6 py-5">
              {sponsors.map((sponsor) => (
                <a
                  key={sponsor.id}
                  href={sponsor.url ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-neutral-600 hover:text-dorado-oscuro"
                >
                  {sponsor.nombre}
                </a>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

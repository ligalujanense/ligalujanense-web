/*
 * Links de YouTube para la transmisión de los partidos.
 * El reproductor SOLO se arma con el identificador que se extrae acá, nunca con el link
 * pegado tal cual: así no se puede meter cualquier otra dirección dentro de la página.
 */

export type Youtube = { tipo: "video" | "canal"; id: string };

const HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtu.be",
  "www.youtube-nocookie.com",
  "youtube-nocookie.com",
]);

const ID_VIDEO = /^[A-Za-z0-9_-]{11}$/;
const ID_CANAL = /^UC[A-Za-z0-9_-]{22}$/;

/**
 * Acepta: youtu.be/ID, youtube.com/watch?v=ID, youtube.com/live/ID, /embed/ID, /shorts/ID
 * y youtube.com/channel/UC… (muestra la transmisión en vivo actual del canal).
 */
export function parsearYoutube(entrada: string | null | undefined): Youtube | null {
  const texto = (entrada ?? "").trim();
  if (!texto) return null;
  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(texto) ? texto : `https://${texto}`);
  } catch {
    return null;
  }
  if (!HOSTS.has(url.hostname.toLowerCase())) return null;

  const partes = url.pathname.split("/").filter(Boolean);
  let candidato: string | null = null;

  if (url.hostname.toLowerCase() === "youtu.be") candidato = partes[0] ?? null;
  else if (partes[0] === "watch") candidato = url.searchParams.get("v");
  else if (["live", "embed", "shorts", "v"].includes(partes[0] ?? "")) candidato = partes[1] ?? null;
  else if (partes[0] === "channel" && partes[1] && ID_CANAL.test(partes[1])) {
    return { tipo: "canal", id: partes[1] };
  }

  return candidato && ID_VIDEO.test(candidato) ? { tipo: "video", id: candidato } : null;
}

/** Dirección del reproductor (sin cookies de seguimiento hasta que se reproduce). */
export function urlReproductor(y: Youtube): string {
  return y.tipo === "video"
    ? `https://www.youtube-nocookie.com/embed/${y.id}?rel=0&modestbranding=1&playsinline=1`
    : `https://www.youtube-nocookie.com/embed/live_stream?channel=${y.id}&rel=0&modestbranding=1&playsinline=1`;
}

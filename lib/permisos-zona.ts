import { canManageZona } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/admin";

/*
 * Comprobaciones de pertenencia para las acciones del admin.
 *
 * Las acciones reciben ids desde el navegador. Verificar solo "¿maneja esta
 * zona?" con el zonaId que manda el cliente no alcanza: un encargado podría
 * mandar SU zona junto con el id de un partido de OTRA zona. Estas funciones
 * miran en la base a qué zona pertenece de verdad cada cosa.
 *
 * Este archivo NO es "use server" a propósito: no se puede llamar desde el navegador.
 */

export async function zonaDeFecha(fechaId: string) {
  const { data } = await createAdminClient()
    .from("fixture_fechas")
    .select("zona_id")
    .eq("id", fechaId)
    .single();
  return (data as any)?.zona_id as string | undefined;
}

export async function zonaDePartido(partidoId: string) {
  const { data } = await createAdminClient()
    .from("partidos")
    .select("fixture_fechas ( zona_id )")
    .eq("id", partidoId)
    .single();
  return (data as any)?.fixture_fechas?.zona_id as string | undefined;
}

/** Todos los equipos indicados (los vacíos se ignoran) son de la zona. */
export async function equiposDeZona(zonaId: string, ids: (string | null)[]) {
  const reales = [...new Set(ids.filter((x): x is string => !!x))];
  if (reales.length === 0) return true;
  const { data } = await createAdminClient()
    .from("equipos")
    .select("id")
    .eq("zona_id", zonaId)
    .in("id", reales);
  return (data ?? []).length === reales.length;
}

/** El equipo juega ese partido (local o visitante). */
export async function equipoJuegaPartido(partidoId: string, equipoId: string | null) {
  if (!equipoId) return true;
  const { data } = await createAdminClient()
    .from("partidos")
    .select("equipo_local_id, equipo_visitante_id")
    .eq("id", partidoId)
    .single();
  const p = data as any;
  return !!p && (equipoId === p.equipo_local_id || equipoId === p.equipo_visitante_id);
}

const UUID = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";
const RUTA_PLANILLA = new RegExp(`^partidos/(${UUID})/(${UUID})\\.pdf$`, "i");

/** Ruta del PDF de planilla de un equipo en un partido (bucket 'documentos'). */
export function rutaPlanilla(partidoId: string, equipoId: string) {
  return `partidos/${partidoId}/${equipoId}.pdf`;
}

/**
 * `path` es la planilla de un equipo que juega ese partido y el usuario maneja
 * la zona del partido. Evita pisar documentos de otra zona o rutas arbitrarias.
 */
export async function puedeSubirPlanilla(path: string) {
  const m = RUTA_PLANILLA.exec(path);
  if (!m) return false;
  const [, partidoId, equipoId] = m;
  if (!equipoId || !(await equipoJuegaPartido(partidoId, equipoId))) return false;
  const zonaId = await zonaDePartido(partidoId);
  return !!zonaId && (await canManageZona(zonaId));
}

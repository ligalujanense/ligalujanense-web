"use server";

import { revalidatePath } from "next/cache";
import { canManageZona, getUsuario } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/admin";

async function zonaDelPartido(partidoId: string) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("partidos")
    .select("fixture_fechas ( zona_id )")
    .eq("id", partidoId)
    .single();
  return (data as any)?.fixture_fechas?.zona_id as string | undefined;
}

export async function guardarResultado(partidoId: string, formData: FormData) {
  const zonaId = await zonaDelPartido(partidoId);
  if (!zonaId || !(await canManageZona(zonaId))) return { error: "No autorizado" };

  const resultado_local = formData.get("resultado_local");
  const resultado_visitante = formData.get("resultado_visitante");

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("partidos")
    .update({
      resultado_local: resultado_local === "" ? null : Number(resultado_local),
      resultado_visitante: resultado_visitante === "" ? null : Number(resultado_visitante),
      estado:
        resultado_local !== "" && resultado_visitante !== "" ? "jugado" : "pendiente",
    })
    .eq("id", partidoId);
  if (error) return { error: error.message };

  revalidatePath(`/admin/partidos/${partidoId}`);
  revalidatePath("/posiciones");
  revalidatePath("/fixture");
}

export async function agregarGol(partidoId: string, formData: FormData) {
  const zonaId = await zonaDelPartido(partidoId);
  if (!zonaId || !(await canManageZona(zonaId))) return { error: "No autorizado" };

  const equipo_id = String(formData.get("equipo_id") ?? "") || null;
  const jugador = String(formData.get("jugador") ?? "").trim();
  const minuto = formData.get("minuto");
  if (!jugador) return { error: "Falta el jugador" };

  const supabase = createAdminClient();
  const { error } = await supabase.from("goles").insert({
    partido_id: partidoId,
    equipo_id,
    jugador,
    minuto: minuto === "" ? null : Number(minuto),
  });
  if (error) return { error: error.message };

  revalidatePath(`/admin/partidos/${partidoId}`);
}

export async function eliminarGol(partidoId: string, id: string) {
  const zonaId = await zonaDelPartido(partidoId);
  if (!zonaId || !(await canManageZona(zonaId))) return { error: "No autorizado" };

  const supabase = createAdminClient();
  await supabase.from("goles").delete().eq("id", id);
  revalidatePath(`/admin/partidos/${partidoId}`);
}

export async function agregarTarjeta(partidoId: string, formData: FormData) {
  const zonaId = await zonaDelPartido(partidoId);
  if (!zonaId || !(await canManageZona(zonaId))) return { error: "No autorizado" };

  const equipo_id = String(formData.get("equipo_id") ?? "") || null;
  const jugador = String(formData.get("jugador") ?? "").trim();
  const tipo = String(formData.get("tipo") ?? "amarilla");
  const minuto = formData.get("minuto");
  const motivo = String(formData.get("motivo") ?? "").trim();
  if (!jugador) return { error: "Falta el jugador" };

  const supabase = createAdminClient();
  const { error } = await supabase.from("tarjetas").insert({
    partido_id: partidoId,
    equipo_id,
    jugador,
    tipo,
    minuto: minuto === "" ? null : Number(minuto),
    motivo: motivo || null,
  });
  if (error) return { error: error.message };

  revalidatePath(`/admin/partidos/${partidoId}`);
}

export async function eliminarTarjeta(partidoId: string, id: string) {
  const zonaId = await zonaDelPartido(partidoId);
  if (!zonaId || !(await canManageZona(zonaId))) return { error: "No autorizado" };

  const supabase = createAdminClient();
  await supabase.from("tarjetas").delete().eq("id", id);
  revalidatePath(`/admin/partidos/${partidoId}`);
}

export async function guardarPlanilla(
  partidoId: string,
  equipoId: string,
  pdfUrl: string
) {
  const zonaId = await zonaDelPartido(partidoId);
  if (!zonaId || !(await canManageZona(zonaId))) return { error: "No autorizado" };

  const usuario = await getUsuario();
  const supabase = createAdminClient();
  const { error } = await supabase.from("planillas_partido").upsert(
    {
      partido_id: partidoId,
      equipo_id: equipoId,
      pdf_url: pdfUrl,
      estado: "subida",
      confirmado_por: usuario?.id,
    },
    { onConflict: "partido_id,equipo_id" }
  );
  if (error) return { error: error.message };

  revalidatePath(`/admin/partidos/${partidoId}`);
}

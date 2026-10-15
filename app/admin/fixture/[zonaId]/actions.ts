"use server";

import { revalidatePath } from "next/cache";
import { canManageZona } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { equiposDeZona, zonaDeFecha, zonaDePartido } from "@/lib/permisos-zona";

export async function crearFecha(zonaId: string, formData: FormData) {
  if (!(await canManageZona(zonaId))) return { error: "No autorizado" };

  const numero_fecha = Number(formData.get("numero_fecha"));
  if (!numero_fecha) return { error: "Falta el número de fecha" };

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("fixture_fechas")
    .insert({ zona_id: zonaId, numero_fecha });
  if (error) return { error: error.message };

  revalidatePath(`/admin/fixture/${zonaId}`);
  revalidatePath("/fixture");
}

export async function crearPartido(zonaId: string, formData: FormData) {
  if (!(await canManageZona(zonaId))) return { error: "No autorizado" };

  const fixture_fecha_id = String(formData.get("fixture_fecha_id") ?? "");
  const equipo_local_id = String(formData.get("equipo_local_id") ?? "") || null;
  const equipo_visitante_id = String(formData.get("equipo_visitante_id") ?? "") || null;
  const libre_equipo_id = String(formData.get("libre_equipo_id") ?? "") || null;
  const hora = String(formData.get("hora") ?? "") || null;
  const estadio = String(formData.get("estadio") ?? "") || null;
  const fecha = String(formData.get("fecha") ?? "") || null;

  if (!fixture_fecha_id) return { error: "Falta la fecha" };
  if (!libre_equipo_id && (!equipo_local_id || !equipo_visitante_id)) {
    return { error: "Elegí local y visitante, o el equipo libre" };
  }
  if (!libre_equipo_id && !fecha) return { error: "Elegí el día del partido" };
  // La jornada y los equipos tienen que ser de ESTA zona.
  if ((await zonaDeFecha(fixture_fecha_id)) !== zonaId) return { error: "No autorizado" };
  if (!(await equiposDeZona(zonaId, [equipo_local_id, equipo_visitante_id, libre_equipo_id]))) {
    return { error: "No autorizado" };
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("partidos").insert({
    fixture_fecha_id,
    equipo_local_id: libre_equipo_id ? null : equipo_local_id,
    equipo_visitante_id: libre_equipo_id ? null : equipo_visitante_id,
    libre_equipo_id,
    hora,
    estadio,
    fecha: libre_equipo_id ? null : fecha,
  });
  if (error) return { error: error.message };

  revalidatePath(`/admin/fixture/${zonaId}`);
  revalidatePath("/fixture");
  revalidatePath("/");
}

export async function editarPartido(zonaId: string, id: string, formData: FormData) {
  if (!(await canManageZona(zonaId))) return { error: "No autorizado" };
  if ((await zonaDePartido(id)) !== zonaId) return { error: "No autorizado" };

  const equipo_local_id = String(formData.get("equipo_local_id") ?? "") || null;
  const equipo_visitante_id = String(formData.get("equipo_visitante_id") ?? "") || null;
  const libre_equipo_id = String(formData.get("libre_equipo_id") ?? "") || null;
  const hora = String(formData.get("hora") ?? "") || null;
  const estadio = String(formData.get("estadio") ?? "") || null;
  const fecha = String(formData.get("fecha") ?? "") || null;

  if (!libre_equipo_id && (!equipo_local_id || !equipo_visitante_id)) {
    return { error: "Elegí local y visitante, o el equipo libre" };
  }
  if (!libre_equipo_id && !fecha) return { error: "Elegí el día del partido" };
  if (!(await equiposDeZona(zonaId, [equipo_local_id, equipo_visitante_id, libre_equipo_id]))) {
    return { error: "No autorizado" };
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("partidos")
    .update({
      equipo_local_id: libre_equipo_id ? null : equipo_local_id,
      equipo_visitante_id: libre_equipo_id ? null : equipo_visitante_id,
      libre_equipo_id,
      hora,
      estadio,
      fecha: libre_equipo_id ? null : fecha,
    })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath(`/admin/fixture/${zonaId}`);
  revalidatePath("/fixture");
  revalidatePath(`/partidos/${id}`);
  revalidatePath("/");
}

export async function eliminarFecha(zonaId: string, id: string) {
  if (!(await canManageZona(zonaId))) return { error: "No autorizado" };

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("fixture_fechas")
    .delete()
    .eq("id", id)
    .eq("zona_id", zonaId);
  if (error) return { error: error.message };

  revalidatePath(`/admin/fixture/${zonaId}`);
  revalidatePath("/fixture");
}

export async function eliminarPartido(zonaId: string, id: string) {
  if (!(await canManageZona(zonaId))) return { error: "No autorizado" };
  if ((await zonaDePartido(id)) !== zonaId) return { error: "No autorizado" };

  const supabase = createAdminClient();
  const { error } = await supabase.from("partidos").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath(`/admin/fixture/${zonaId}`);
  revalidatePath("/fixture");
}

import { createClient } from "./server";

export type Rol = "admin" | "encargado_zona";

export type Usuario = {
  id: string;
  email: string;
  rol: Rol;
  zona_id: string | null;
  nombre: string | null;
};

export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getUsuario(): Promise<Usuario | null> {
  const user = await getUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("usuarios")
    .select("id, email, rol, zona_id, nombre")
    .eq("id", user.id)
    .single();

  return data as Usuario | null;
}

export async function isAdmin() {
  const usuario = await getUsuario();
  return usuario?.rol === "admin";
}

/** True for admin, or for encargado_zona scoped to the given zone. */
export async function canManageZona(zonaId: string) {
  const usuario = await getUsuario();
  if (!usuario) return false;
  if (usuario.rol === "admin") return true;
  return usuario.rol === "encargado_zona" && usuario.zona_id === zonaId;
}

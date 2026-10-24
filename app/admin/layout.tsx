import { getUsuario } from "@/lib/supabase/auth";
import { AdminSidebar } from "./AdminSidebar";

const linksAdminGeneral = [
  { href: "/admin", label: "Inicio" },
  { href: "/admin/zonas", label: "Zonas y equipos" },
  { href: "/admin/clubes", label: "Clubes" },
  { href: "/admin/fixture", label: "Fixture" },
  { href: "/admin/fase-final", label: "Fase final" },
  { href: "/admin/goleadores", label: "Goleadores" },
  { href: "/admin/usuarios", label: "Usuarios" },
  { href: "/admin/noticias", label: "Noticias" },
  { href: "/admin/sponsors", label: "Sponsors" },
  { href: "/admin/institucional", label: "Institucional" },
  { href: "/admin/autoridades", label: "Autoridades" },
  { href: "/admin/cuenta", label: "Mi cuenta" },
];

const linksEncargado = [
  { href: "/admin", label: "Inicio" },
  { href: "/admin/fixture", label: "Fixture" },
  { href: "/admin/cuenta", label: "Mi cuenta" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const usuario = await getUsuario();
  const links = usuario?.rol === "admin" ? linksAdminGeneral : linksEncargado;

  return (
    <div className="min-h-screen bg-crema md:flex">
      <AdminSidebar links={links} rol={usuario?.rol ?? ""} />
      {/* En celulares el contenido baja para no quedar debajo de la barra fija. */}
      <main className="admin-contenido flex-1 min-w-0 p-4 pt-20 md:p-6">{children}</main>
    </div>
  );
}

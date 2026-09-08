import { getUsuario } from "@/lib/supabase/auth";
import { AdminSidebar } from "./AdminSidebar";

const linksAdminGeneral = [
  { href: "/admin", label: "Inicio" },
  { href: "/admin/zonas", label: "Zonas" },
  { href: "/admin/clubes", label: "Clubes" },
  { href: "/admin/equipos", label: "Equipos" },
  { href: "/admin/fixture", label: "Fixture" },
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
    <div className="min-h-screen bg-crema flex">
      <AdminSidebar links={links} rol={usuario?.rol ?? ""} />
      <main className="flex-1 p-6 min-w-0">{children}</main>
    </div>
  );
}

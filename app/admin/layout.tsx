import Link from "next/link";
import { getUsuario } from "@/lib/supabase/auth";

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
    <div className="min-h-screen bg-crema">
      <header className="bg-dorado-oscuro text-white px-6 py-4 flex items-center justify-between flex-wrap gap-2">
        <span className="font-bold">Panel — Liga Lujanense</span>
        <span className="text-sm opacity-80">{usuario?.rol}</span>
      </header>
      <nav className="bg-white border-b border-neutral-200 px-6 py-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="hover:text-dorado-oscuro">
            {link.label}
          </Link>
        ))}
      </nav>
      <main className="p-6">{children}</main>
    </div>
  );
}

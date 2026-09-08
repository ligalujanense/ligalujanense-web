"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function AdminSidebar({
  links,
  rol,
}: {
  links: { href: string; label: string }[];
  rol: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function cerrarSesion() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  }

  return (
    <aside className="w-56 shrink-0 bg-white border-r border-neutral-200 min-h-screen flex flex-col justify-between sticky top-0 h-screen">
      <div>
        <div className="flex items-center gap-2 px-4 py-4 border-b border-neutral-200">
          <span className="flex items-center justify-center w-9 h-9 rounded-full border-2 border-dorado p-1 shrink-0">
            <Image src="/logo.png" alt="" width={28} height={31} className="w-full h-auto" />
          </span>
          <div className="leading-tight">
            <p className="font-extrabold text-celeste-oscuro text-sm">Liga Lujanense</p>
            <p className="text-[11px] text-neutral-400 uppercase tracking-wide">Panel admin</p>
          </div>
        </div>

        <nav className="flex flex-col py-2">
          {links.map((link) => {
            const activo = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2.5 text-sm font-semibold border-l-4 transition-colors ${
                  activo
                    ? "border-dorado bg-dorado/10 text-celeste-oscuro"
                    : "border-transparent text-neutral-600 hover:bg-neutral-50 hover:text-celeste-oscuro"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-neutral-200 px-4 py-3 flex flex-col gap-2 text-sm">
        <span className="text-[11px] uppercase tracking-wide text-neutral-400">{rol}</span>
        <Link href="/" className="text-neutral-600 hover:text-celeste-oscuro font-semibold">
          ← Ir al sitio
        </Link>
        <button
          onClick={cerrarSesion}
          className="text-left text-red-600 hover:underline font-semibold"
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}

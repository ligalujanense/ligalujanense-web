"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
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
  // En pantallas chicas el menú es un cajón que se abre con el botón de arriba.
  const [abierto, setAbierto] = useState(false);

  // Al navegar a otra sección, se cierra el cajón.
  useEffect(() => {
    setAbierto(false);
  }, [pathname]);

  async function cerrarSesion() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  }

  const marca = (
    <div className="flex items-center gap-2">
      <span className="flex items-center justify-center w-9 h-9 rounded-full border-2 border-dorado p-1 shrink-0">
        <Image src="/logo.png" alt="" width={28} height={31} className="w-full h-auto" />
      </span>
      <div className="leading-tight">
        <p className="font-extrabold text-celeste-oscuro text-sm">Liga Lujanense</p>
        <p className="text-[11px] text-neutral-400 uppercase tracking-wide">Panel admin</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Barra superior: solo en celulares */}
      <header className="md:hidden fixed top-0 inset-x-0 z-30 h-14 bg-white border-b border-neutral-200 flex items-center gap-3 px-3">
        <button
          type="button"
          onClick={() => setAbierto(true)}
          aria-label="Abrir menú"
          className="p-2 -ml-1 rounded text-celeste-oscuro hover:bg-neutral-100"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        {marca}
      </header>

      {/* Fondo oscuro detrás del cajón */}
      {abierto && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/40"
          onClick={() => setAbierto(false)}
          aria-hidden="true"
        />
      )}

      <aside
        // h-dvh: en celulares 100vh incluye lo que tapa la barra del navegador y
        // dejaba "Cerrar sesión" fuera de la pantalla.
        className={`fixed md:sticky top-0 left-0 z-50 h-dvh md:h-screen w-64 md:w-56 shrink-0 bg-white border-r border-neutral-200 flex flex-col justify-between transition-transform duration-200 ${
          abierto ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="overflow-y-auto">
          <div className="flex items-center justify-between px-4 py-4 border-b border-neutral-200">
            {marca}
            <button
              type="button"
              onClick={() => setAbierto(false)}
              aria-label="Cerrar menú"
              className="md:hidden p-1 rounded text-neutral-500 hover:bg-neutral-100"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          <nav className="flex flex-col py-2">
            {links.map((link) => {
              const activo = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-3 md:py-2.5 text-sm font-semibold border-l-4 transition-colors ${
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

        <div className="border-t border-neutral-200 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex flex-col gap-2 text-sm">
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
    </>
  );
}

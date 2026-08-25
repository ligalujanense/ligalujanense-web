import Image from "next/image";
import Link from "next/link";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/noticias", label: "Noticias" },
  { href: "/fixture", label: "Fixture" },
  { href: "/posiciones", label: "Posiciones" },
  { href: "/clubes", label: "Clubes" },
  { href: "/institucional", label: "Institucional" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b-2 border-dorado">
      <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-extrabold text-lg text-marino-oscuro tracking-tight">
          <Image src="/logo.png" alt="Liga Lujanense" width={40} height={44} className="h-10 w-auto" priority />
          <span className="hidden sm:inline">Liga Lujanense</span>
        </Link>
        <nav className="flex flex-wrap gap-x-1 text-sm font-semibold">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-2 rounded-md text-neutral-600 hover:text-marino-oscuro hover:bg-dorado/10 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

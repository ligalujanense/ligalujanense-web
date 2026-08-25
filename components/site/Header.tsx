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
    <header className="sticky top-0 z-50 bg-marino-oscuro/95 backdrop-blur border-b border-dorado/20">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-extrabold text-lg text-white tracking-tight">
          <span className="w-9 h-9 rounded-full bg-dorado text-marino-oscuro flex items-center justify-center font-black text-sm">
            LL
          </span>
          <span className="hidden sm:inline">Liga Lujanense</span>
        </Link>
        <nav className="flex flex-wrap gap-x-1 text-sm font-medium">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-2 rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

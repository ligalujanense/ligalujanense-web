import Image from "next/image";
import Link from "next/link";

const links = [
  { href: "/noticias", label: "Noticias" },
  { href: "/fixture", label: "Fixture" },
  { href: "/posiciones", label: "Posiciones" },
  { href: "/clubes", label: "Clubes" },
  { href: "/institucional", label: "Institucional" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <Link href="/" className="shrink-0 flex items-center gap-3">
          <span className="flex items-center justify-center w-14 h-14 rounded-full border-2 border-dorado p-1.5 shrink-0">
            <Image src="/logo.png" alt="Liga Lujanense" width={44} height={49} className="w-full h-auto" priority />
          </span>
          <span className="hidden sm:block font-extrabold text-celeste-oscuro leading-tight text-sm tracking-tight">
            Liga Lujanense
            <br />
            de Fútbol
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-4 shrink-0">
          <Image src="/afa.png" alt="Afiliado a AFA" width={36} height={45} className="h-10 w-auto" />
          <Image
            src="/consejo-federal.png"
            alt="Consejo Federal"
            width={40}
            height={40}
            className="h-9 w-9 rounded-full"
          />
        </div>

        <nav className="flex flex-wrap items-center gap-x-1 sm:gap-x-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-2.5 sm:px-3 py-2 text-[11px] sm:text-xs font-bold uppercase tracking-[0.12em] text-celeste-oscuro/80 hover:text-dorado-oscuro transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

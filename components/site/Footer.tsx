import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-dorado-oscuro text-white/80 text-sm mt-16">
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2 font-semibold text-white">
          <Image src="/logo.png" alt="Liga Lujanense" width={28} height={32} className="h-7 w-auto" />
          Liga Lujanense de Fútbol
        </div>
        <div className="flex gap-4">
          <a href="/institucional" className="hover:text-white transition-colors">
            Reglamento y estatutos
          </a>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}

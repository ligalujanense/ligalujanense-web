export function Footer() {
  return (
    <footer className="bg-dorado-oscuro text-white/80 text-sm mt-16">
      <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col gap-1">
        <span>
          © {new Date().getFullYear()} Liga Lujanense de Fútbol
        </span>
        <a href="/institucional" className="hover:text-white transition-colors">
          Reglamento y estatutos
        </a>
      </div>
    </footer>
  );
}

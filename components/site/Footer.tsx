export function Footer() {
  return (
    <footer className="bg-marino-oscuro text-white/70 text-sm mt-16 border-t border-white/10">
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2 font-semibold text-white">
          <span className="w-7 h-7 rounded-full bg-dorado text-marino-oscuro flex items-center justify-center font-black text-xs">
            LL
          </span>
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

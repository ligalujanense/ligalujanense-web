import Link from "next/link";

const items = [
  { href: "/fixture", label: "Fixture" },
  { href: "/posiciones", label: "Posiciones" },
  { href: "/clubes", label: "Clubes" },
  { href: "/institucional", label: "Institucional" },
];

export function QuickLinks() {
  return (
    <div className="bg-celeste-oscuro">
      <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-4">
        {items.map((item, i) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center justify-center gap-2 py-4 px-3 text-xs sm:text-sm font-bold uppercase tracking-wide text-white hover:bg-white/10 transition-colors ${
              i > 0 ? "border-l border-white/15" : ""
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

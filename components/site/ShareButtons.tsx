"use client";

import { useEffect, useState } from "react";

export function ShareButtons({ title, path }: { title: string; path: string }) {
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const url = `${origin}${path}`;

  const links = [
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
    },
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    },
    {
      label: "X",
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    },
  ];

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-neutral-500">Compartir:</span>
      {links.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="px-2 py-1 rounded border border-neutral-300 hover:border-dorado hover:text-dorado-oscuro transition-colors"
        >
          {link.label}
        </a>
      ))}
      <button
        type="button"
        onClick={() => navigator.clipboard.writeText(url)}
        className="px-2 py-1 rounded border border-neutral-300 hover:border-dorado hover:text-dorado-oscuro transition-colors"
      >
        Copiar link
      </button>
    </div>
  );
}

import Link from "next/link";

const secciones = [
  { href: "/admin/zonas", label: "Zonas", desc: "Zona Oeste, Zona Sur, etc." },
  { href: "/admin/clubes", label: "Clubes", desc: "Alta y datos de clubes afiliados" },
  { href: "/admin/equipos", label: "Equipos", desc: "Asignar clubes a cada zona" },
  { href: "/admin/usuarios", label: "Usuarios", desc: "Admins y encargados de zona" },
  { href: "/admin/noticias", label: "Noticias", desc: "Publicar novedades" },
  { href: "/admin/sponsors", label: "Sponsors", desc: "Marcas auspiciantes" },
  { href: "/admin/autoridades", label: "Autoridades", desc: "Comisión directiva" },
];

export default function AdminHome() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Bienvenido</h1>
        <p className="text-neutral-600">
          Empezá cargando <strong>Zonas</strong>, después <strong>Clubes</strong> y
          finalmente asigná cada club a su zona en <strong>Equipos</strong>.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {secciones.map((seccion) => (
          <Link
            key={seccion.href}
            href={seccion.href}
            className="bg-white border border-neutral-200 rounded-lg p-4 hover:border-dorado transition-colors"
          >
            <p className="font-semibold">{seccion.label}</p>
            <p className="text-sm text-neutral-500">{seccion.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

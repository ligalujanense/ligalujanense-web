"use client";

import { useState, useTransition } from "react";
import { crearEncargado, eliminarUsuario } from "./actions";

type Zona = { id: string; nombre: string };
type Usuario = {
  id: string;
  email: string;
  rol: "admin" | "encargado_zona";
  zona_id: string | null;
};

export function UsuariosAdminList({
  usuarios,
  zonas,
}: {
  usuarios: Usuario[];
  zonas: Zona[];
}) {
  const [isPending, startTransition] = useTransition();
  const [rol, setRol] = useState<"admin" | "encargado_zona">("encargado_zona");
  const nombreZona = (id: string | null) => zonas.find((z) => z.id === id)?.nombre;

  return (
    <div className="flex flex-col gap-6">
      <form
        action={(formData) => startTransition(() => { crearEncargado(formData); })}
        className="flex flex-wrap items-end gap-3 bg-white border border-neutral-200 rounded-lg p-4"
      >
        <label className="flex flex-col gap-1 text-sm">
          Email
          <input type="email" name="email" required className="border border-neutral-300 rounded px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Contraseña
          <input type="password" name="password" required className="border border-neutral-300 rounded px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Rol
          <select
            name="rol"
            value={rol}
            onChange={(e) => setRol(e.target.value as "admin" | "encargado_zona")}
            className="border border-neutral-300 rounded px-3 py-2"
          >
            <option value="encargado_zona">Encargado de zona</option>
            <option value="admin">Admin general</option>
          </select>
        </label>
        {rol === "encargado_zona" && (
          <label className="flex flex-col gap-1 text-sm">
            Zona a cargo
            <select name="zona_id" required className="border border-neutral-300 rounded px-3 py-2">
              <option value="">Elegir zona</option>
              {zonas.map((zona) => (
                <option key={zona.id} value={zona.id}>
                  {zona.nombre}
                </option>
              ))}
            </select>
          </label>
        )}
        <button
          type="submit"
          disabled={isPending}
          className="bg-dorado hover:bg-dorado-oscuro text-white font-semibold rounded px-4 py-2 disabled:opacity-50"
        >
          Crear usuario
        </button>
      </form>

      <ul className="flex flex-col gap-2">
        {usuarios.map((usuario) => (
          <li
            key={usuario.id}
            className="flex items-center justify-between bg-white border border-neutral-200 rounded-lg px-4 py-2"
          >
            <span>
              <strong>{usuario.email}</strong> —{" "}
              {usuario.rol === "admin" ? "Admin general" : `Encargado de ${nombreZona(usuario.zona_id) ?? "?"}`}
            </span>
            <button
              onClick={() => startTransition(() => { eliminarUsuario(usuario.id); })}
              className="text-red-600 text-sm hover:underline"
            >
              Eliminar
            </button>
          </li>
        ))}
        {usuarios.length === 0 && (
          <p className="text-neutral-500 text-sm">No hay usuarios cargados todavía.</p>
        )}
      </ul>
    </div>
  );
}

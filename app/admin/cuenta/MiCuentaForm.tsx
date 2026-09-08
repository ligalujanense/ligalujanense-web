"use client";

import { useState, useTransition } from "react";
import { actualizarNombre } from "./actions";
import { createClient } from "@/lib/supabase/client";

export function MiCuentaForm({
  email,
  nombre,
  rol,
}: {
  email: string;
  nombre: string | null;
  rol: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [nombreGuardado, setNombreGuardado] = useState(false);

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordGuardado, setPasswordGuardado] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError(null);
    setPasswordGuardado(false);

    if (password.length < 6) {
      setPasswordError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== passwordConfirm) {
      setPasswordError("Las contraseñas no coinciden.");
      return;
    }

    setPasswordLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setPasswordLoading(false);

    if (error) {
      setPasswordError("No se pudo cambiar la contraseña. Intentá de nuevo.");
      return;
    }

    setPassword("");
    setPasswordConfirm("");
    setPasswordGuardado(true);
  }

  return (
    <div className="flex flex-col gap-6 max-w-md">
      <section className="bg-white border border-neutral-200 rounded-lg p-4 flex flex-col gap-3">
        <h2 className="font-semibold">Datos de la cuenta</h2>
        <div className="text-sm text-neutral-500">
          <p>Email: <span className="text-neutral-800">{email}</span></p>
          <p>Rol: <span className="text-neutral-800">{rol === "admin" ? "Admin general" : "Encargado de zona"}</span></p>
        </div>
        <form
          action={(formData) => {
            setNombreGuardado(false);
            startTransition(async () => {
              await actualizarNombre(formData);
              setNombreGuardado(true);
            });
          }}
          className="flex flex-col gap-3"
        >
          <label className="flex flex-col gap-1 text-sm">
            Nombre
            <input
              name="nombre"
              defaultValue={nombre ?? ""}
              placeholder="Tu nombre"
              className="border border-neutral-300 rounded px-3 py-2"
            />
          </label>
          <button
            type="submit"
            disabled={isPending}
            className="bg-dorado hover:bg-dorado-oscuro text-white font-semibold rounded px-4 py-2 disabled:opacity-50 self-start"
          >
            Guardar nombre
          </button>
          {nombreGuardado && <span className="text-xs text-green-700">Guardado ✓</span>}
        </form>
      </section>

      <section className="bg-white border border-neutral-200 rounded-lg p-4 flex flex-col gap-3">
        <h2 className="font-semibold">Cambiar contraseña</h2>
        <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm">
            Nueva contraseña
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-neutral-300 rounded px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Confirmar contraseña
            <input
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              className="border border-neutral-300 rounded px-3 py-2"
            />
          </label>
          {passwordError && <span className="text-xs text-red-600">{passwordError}</span>}
          {passwordGuardado && <span className="text-xs text-green-700">Contraseña actualizada ✓</span>}
          <button
            type="submit"
            disabled={passwordLoading}
            className="bg-dorado hover:bg-dorado-oscuro text-white font-semibold rounded px-4 py-2 disabled:opacity-50 self-start"
          >
            Cambiar contraseña
          </button>
        </form>
      </section>
    </div>
  );
}

"use client";

import { useTransition } from "react";
import { guardarIntroduccion } from "./actions";

export function IntroduccionForm({ contenido }: { contenido: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => startTransition(() => { guardarIntroduccion(formData); })}
      className="flex flex-col gap-3 bg-white border border-neutral-200 rounded-lg p-4 max-w-2xl"
    >
      <label className="flex flex-col gap-1 text-sm">
        Texto introductorio
        <textarea
          name="contenido"
          rows={8}
          defaultValue={contenido}
          placeholder="Contá brevemente la historia, misión o algo relevante sobre la liga..."
          className="border border-neutral-300 rounded px-3 py-2"
        />
      </label>
      <button
        type="submit"
        disabled={isPending}
        className="bg-dorado hover:bg-dorado-oscuro text-white font-semibold rounded px-4 py-2 disabled:opacity-50 self-start"
      >
        Guardar
      </button>
    </form>
  );
}

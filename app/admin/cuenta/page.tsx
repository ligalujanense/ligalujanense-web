import { getUsuario } from "@/lib/supabase/auth";
import { MiCuentaForm } from "./MiCuentaForm";

export default async function CuentaPage() {
  const usuario = await getUsuario();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Mi cuenta</h1>
      <MiCuentaForm
        email={usuario?.email ?? ""}
        nombre={usuario?.nombre ?? null}
        rol={usuario?.rol ?? ""}
      />
    </div>
  );
}

import { createAdminClient } from "@/lib/supabase/admin";
import { IntroduccionForm } from "./IntroduccionForm";

export default async function InstitucionalAdminPage() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("institucional")
    .select("contenido")
    .eq("id", "main")
    .single();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Institucional</h1>
      <p className="text-neutral-500 text-sm max-w-2xl">
        Este texto aparece arriba del listado de autoridades en la página pública de Institucional.
        Las autoridades se gestionan aparte, en la sección &quot;Autoridades&quot;.
      </p>
      <IntroduccionForm contenido={data?.contenido ?? ""} />
    </div>
  );
}

import { NuevaNoticiaForm } from "./NuevaNoticiaForm";

export default function NuevaNoticiaPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Nueva noticia</h1>
      <NuevaNoticiaForm />
    </div>
  );
}

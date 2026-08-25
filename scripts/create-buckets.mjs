// One-off script to create Storage buckets.
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const buckets = [
  { id: "imagenes", public: true }, // logos de clubes/sponsors, imágenes de noticias
  { id: "documentos", public: false }, // PDFs de fixture y planillas de partido
];

for (const bucket of buckets) {
  const { error } = await supabase.storage.createBucket(bucket.id, {
    public: bucket.public,
  });
  if (error && !error.message.includes("already exists")) {
    console.error(`Error creando bucket ${bucket.id}:`, error.message);
  } else {
    console.log(`Bucket listo: ${bucket.id}`);
  }
}

// One-off script to create/promote an admin user.
// Usage: node scripts/create-admin.mjs <email> <password>
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.local" });

const [, , email, password] = process.argv;
if (!email || !password) {
  console.error("Usage: node scripts/create-admin.mjs <email> <password>");
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const { data, error } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
});

if (error) {
  console.error("Error creando usuario:", error.message);
  process.exit(1);
}

const { error: insertError } = await supabase
  .from("usuarios")
  .insert({ id: data.user.id, email, rol: "admin" });

if (insertError) {
  console.error("Usuario creado pero falló el insert en usuarios:", insertError.message);
  process.exit(1);
}

console.log(`Admin creado: ${email} (id: ${data.user.id})`);

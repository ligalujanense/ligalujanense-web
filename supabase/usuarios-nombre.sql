-- Agrega un nombre visible a cada usuario del panel (admin/encargado),
-- para la sección "Mi cuenta". Ejecutar en el SQL Editor de Supabase.

alter table usuarios add column if not exists nombre text;

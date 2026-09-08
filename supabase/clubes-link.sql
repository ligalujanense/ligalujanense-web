-- Link externo del club (sitio web, Instagram, etc.) para la tarjeta pública.
-- Ejecutar en el SQL Editor de Supabase.

alter table clubes add column if not exists link text;

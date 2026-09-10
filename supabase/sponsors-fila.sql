-- Fila en la que se muestra cada sponsor en el home (1 = fila principal,
-- 2 = fila secundaria, para los logos de tamaños/proporciones dispares).
-- Ejecutar en el SQL Editor de Supabase.

alter table sponsors add column if not exists fila smallint not null default 1;

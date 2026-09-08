-- Punto de partida manual por equipo (PJ/PG/PE/PP/GF/GC/Pts) para que la tabla
-- de posiciones cuadre con la tabla oficial en PDF sin cargar retroactivamente
-- todos los partidos ya jugados. Se suma a lo que se calcule de acá en adelante
-- a partir del fixture cargado en el sistema.
--
-- "categoria" en zonas permite agrupar dentro de Torneos (Fútbol Masculino,
-- y a futuro Fútbol Femenino / Categorías Formativas) sin cambiar rutas.
--
-- Ejecutar en el SQL Editor de Supabase.

alter table equipos add column if not exists ajuste_pj integer not null default 0;
alter table equipos add column if not exists ajuste_pg integer not null default 0;
alter table equipos add column if not exists ajuste_pe integer not null default 0;
alter table equipos add column if not exists ajuste_pp integer not null default 0;
alter table equipos add column if not exists ajuste_gf integer not null default 0;
alter table equipos add column if not exists ajuste_gc integer not null default 0;
alter table equipos add column if not exists ajuste_pts integer not null default 0;

alter table zonas add column if not exists categoria text not null default 'futbol-masculino';

-- Fase final (cruces eliminatorios). Tablas aparte de fixture/partidos a propósito:
-- así estos partidos NO se suman a la tabla de posiciones.
--
-- Un "cruce" enfrenta al club A contra el club B. Cada lado es un club directo
-- (club_a_id / club_b_id) o viene de otro cruce (origen_a / origen_b):
--   'G:4'  = ganador del cruce de código 4
--   'P:FA' = perdedor del cruce FA (Final Anual)
-- Local: en la IDA es A, en la VUELTA es B (se invierte solo). Los goles se
-- guardan por club (goles_a / goles_b), no por local/visitante.

create table if not exists fase_final_cruces (
  id uuid primary key default gen_random_uuid(),
  categoria text not null default 'futbol-masculino',
  temporada text not null,
  ronda text not null check (ronda in ('final_anual', 'fase1', 'fase2', 'semifinal', 'final')),
  codigo text not null,            -- '1', 'a', 'X', 'FA', 'F'
  orden int not null default 0,    -- posición dentro de la ronda en el cuadro
  formato text not null default 'ida_vuelta' check (formato in ('ida_vuelta', 'unico')),
  club_a_id uuid references clubes(id) on delete set null,
  club_b_id uuid references clubes(id) on delete set null,
  origen_a text,
  origen_b text,
  penales_a int,
  penales_b int,
  created_at timestamptz not null default now(),
  unique (categoria, temporada, codigo)
);

create table if not exists fase_final_partidos (
  id uuid primary key default gen_random_uuid(),
  cruce_id uuid not null references fase_final_cruces(id) on delete cascade,
  tipo text not null check (tipo in ('ida', 'vuelta', 'unico')),
  fecha date,
  hora time,
  estadio text,
  goles_a int,
  goles_b int,
  created_at timestamptz not null default now(),
  unique (cruce_id, tipo)
);

alter table fase_final_cruces enable row level security;
alter table fase_final_partidos enable row level security;

-- Solo lectura pública; la escritura va por Server Actions con service-role.
create policy "lectura publica fase_final_cruces" on fase_final_cruces for select using (true);
create policy "lectura publica fase_final_partidos" on fase_final_partidos for select using (true);

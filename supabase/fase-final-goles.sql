-- Goles por jugador en cada partido de la fase final (se asignan desde el admin, en el partido).
-- Los totales de la fase final (tabla "goleadores" con zona_id NULL) se calculan solos a partir de acá.
create table if not exists fase_final_goles_jugador (
  id uuid primary key default gen_random_uuid(),
  partido_id uuid not null references fase_final_partidos(id) on delete cascade,
  jugador text not null,
  club_id uuid not null references clubes(id) on delete cascade,
  club_nombre text not null,
  goles int not null check (goles > 0),
  created_at timestamptz not null default now()
);

-- Un jugador aparece una sola vez por partido y club (si se vuelve a asignar, se suman los goles).
create unique index if not exists fase_final_goles_jugador_unico
  on fase_final_goles_jugador (partido_id, club_id, lower(jugador));

alter table fase_final_goles_jugador enable row level security;

-- Solo lectura pública; la escritura va por Server Actions con service-role.
create policy "lectura publica fase_final_goles_jugador"
  on fase_final_goles_jugador for select using (true);

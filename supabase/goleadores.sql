-- Goleadores: un total de goles por jugador, por zona (o fase final).
-- Se carga con el reporte "Goleadores" de COMET (admin → Goleadores) o a mano.
-- zona_id NULL = fase final. El goleador anual suma todas las filas de la temporada.
create table if not exists goleadores (
  id uuid primary key default gen_random_uuid(),
  categoria text not null default 'futbol-masculino',
  temporada text not null,
  zona_id uuid references zonas(id) on delete cascade,
  club_id uuid references clubes(id) on delete set null,
  club_nombre text not null,          -- nombre tal cual el reporte (también sirve si el club no está cargado)
  jugador text not null,
  goles int not null check (goles >= 0),
  updated_at timestamptz not null default now()
);

-- Un jugador aparece una sola vez por zona/fase final y club.
create unique index if not exists goleadores_unico on goleadores (
  categoria, temporada,
  coalesce(zona_id, '00000000-0000-0000-0000-000000000000'::uuid),
  lower(club_nombre), lower(jugador)
);

alter table goleadores enable row level security;

-- Solo lectura pública; la escritura va por Server Actions con service-role.
create policy "lectura publica goleadores" on goleadores for select using (true);

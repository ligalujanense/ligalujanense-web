-- Liga Lujanense de Fútbol — schema inicial
-- Ejecutar en el SQL Editor de Supabase.

create extension if not exists "pgcrypto";

create type rol_usuario as enum ('admin', 'encargado_zona');
create type estado_partido as enum ('pendiente', 'jugado', 'suspendido');
create type condicion_jugador as enum ('titular', 'suplente', 'arquero');
create type estado_planilla as enum ('subida', 'confirmada');

-- usuarios: espejo de auth.users con rol y, si aplica, zona a cargo
create table usuarios (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  rol rol_usuario not null default 'encargado_zona',
  zona_id uuid, -- fk agregada tras crear zonas
  created_at timestamptz not null default now()
);

create table zonas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null, -- ej. "Zona Sur"
  temporada text not null, -- ej. "2026"
  created_at timestamptz not null default now()
);

alter table usuarios
  add constraint usuarios_zona_id_fkey foreign key (zona_id) references zonas(id) on delete set null;

create index usuarios_rol_idx on usuarios(rol);

-- clubes: solo datos administrados por la liga por ahora.
-- club_id nullable en usuarios queda para el día que los clubes tengan login propio.
create table clubes (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  logo_url text,
  direccion text,
  contacto text,
  created_at timestamptz not null default now()
);

-- equipos: un club puede tener equipo en más de una zona/categoría
create table equipos (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references clubes(id) on delete cascade,
  zona_id uuid not null references zonas(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (club_id, zona_id)
);

create table fixture_fechas (
  id uuid primary key default gen_random_uuid(),
  zona_id uuid not null references zonas(id) on delete cascade,
  numero_fecha int not null,
  fecha date,
  created_at timestamptz not null default now(),
  unique (zona_id, numero_fecha)
);

create table partidos (
  id uuid primary key default gen_random_uuid(),
  fixture_fecha_id uuid not null references fixture_fechas(id) on delete cascade,
  equipo_local_id uuid references equipos(id) on delete set null,
  equipo_visitante_id uuid references equipos(id) on delete set null,
  libre_equipo_id uuid references equipos(id) on delete set null, -- equipo que descansa esa fecha, si aplica
  estadio text,
  hora time,
  resultado_local int,
  resultado_visitante int,
  estado estado_partido not null default 'pendiente',
  created_at timestamptz not null default now()
);

create index partidos_fixture_fecha_idx on partidos(fixture_fecha_id);

create table goles (
  id uuid primary key default gen_random_uuid(),
  partido_id uuid not null references partidos(id) on delete cascade,
  equipo_id uuid references equipos(id) on delete set null,
  jugador text not null,
  minuto int,
  created_at timestamptz not null default now()
);

create table tarjetas (
  id uuid primary key default gen_random_uuid(),
  partido_id uuid not null references partidos(id) on delete cascade,
  equipo_id uuid references equipos(id) on delete set null,
  jugador text not null,
  tipo text not null check (tipo in ('amarilla', 'roja')),
  minuto int,
  motivo text,
  created_at timestamptz not null default now()
);

-- planillas_partido: una fila por equipo por partido (se suben dos PDFs por partido)
create table planillas_partido (
  id uuid primary key default gen_random_uuid(),
  partido_id uuid not null references partidos(id) on delete cascade,
  equipo_id uuid not null references equipos(id) on delete cascade,
  pdf_url text not null,
  estado estado_planilla not null default 'subida',
  datos_extraidos jsonb, -- respuesta cruda del extractor, antes de confirmar
  confirmado_por uuid references usuarios(id),
  confirmado_at timestamptz,
  created_at timestamptz not null default now(),
  unique (partido_id, equipo_id)
);

create table alineaciones (
  id uuid primary key default gen_random_uuid(),
  planilla_id uuid not null references planillas_partido(id) on delete cascade,
  dni text,
  apellido text not null,
  nombre text not null,
  fecha_nac date,
  condicion condicion_jugador,
  created_at timestamptz not null default now()
);

create table noticias (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  slug text not null unique,
  resumen text,
  contenido text,
  imagen_url text,
  publicado boolean not null default false,
  created_at timestamptz not null default now()
);

create table sponsors (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  logo_url text,
  url text,
  orden int not null default 0
);

create table autoridades (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  cargo text not null,
  orden int not null default 0
);

-- RLS: lectura pública en contenido público; escritura solo vía Server Actions con service-role.
alter table zonas enable row level security;
alter table clubes enable row level security;
alter table equipos enable row level security;
alter table fixture_fechas enable row level security;
alter table partidos enable row level security;
alter table goles enable row level security;
alter table tarjetas enable row level security;
alter table noticias enable row level security;
alter table sponsors enable row level security;
alter table autoridades enable row level security;
alter table usuarios enable row level security;
alter table planillas_partido enable row level security;
alter table alineaciones enable row level security;

create policy "lectura publica zonas" on zonas for select using (true);
create policy "lectura publica clubes" on clubes for select using (true);
create policy "lectura publica equipos" on equipos for select using (true);
create policy "lectura publica fixture_fechas" on fixture_fechas for select using (true);
create policy "lectura publica partidos" on partidos for select using (true);
create policy "lectura publica goles" on goles for select using (true);
create policy "lectura publica tarjetas" on tarjetas for select using (true);
create policy "lectura publica sponsors" on sponsors for select using (true);
create policy "lectura publica autoridades" on autoridades for select using (true);
create policy "lectura publica noticias publicadas" on noticias for select using (publicado = true);

create policy "usuario ve su propia fila" on usuarios for select using (auth.uid() = id);

-- planillas_partido / alineaciones: sin policy de lectura pública (contienen DNI) — solo accesibles vía service-role.

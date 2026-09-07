-- Texto introductorio de la página Institucional (una sola fila).
-- Ejecutar en el SQL Editor de Supabase.

create table if not exists institucional (
  id text primary key default 'main',
  contenido text,
  updated_at timestamptz not null default now()
);

insert into institucional (id, contenido)
values ('main', '')
on conflict (id) do nothing;

alter table institucional enable row level security;

create policy "lectura publica institucional"
  on institucional for select
  using (true);

-- Sin policy de escritura: solo se edita vía Server Action con service-role.

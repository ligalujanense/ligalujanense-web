-- Día en que se juega cada partido. Antes la fecha del calendario estaba solo en la
-- jornada ("Fecha 11"), pero los partidos de una misma jornada se juegan en días
-- distintos (sábado, domingo, etc.).
--
-- Los partidos ya cargados heredan el día de su jornada, así no se pierde nada.
-- Ejecutar en el SQL Editor de Supabase.

alter table partidos add column if not exists fecha date;

update partidos p
set fecha = ff.fecha
from fixture_fechas ff
where ff.id = p.fixture_fecha_id
  and p.fecha is null
  and ff.fecha is not null;

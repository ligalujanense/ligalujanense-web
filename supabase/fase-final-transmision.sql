-- Link de la transmisión (YouTube) de cada partido de la fase final.
-- Se pega desde el admin (Fase final) y se muestra como reproductor en la página del partido.
alter table fase_final_partidos add column if not exists transmision_url text;

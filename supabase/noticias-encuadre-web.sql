-- Encuadre de la foto de la noticia en la WEB (carrusel y tarjetas del inicio, lista de
-- noticias). Es independiente del encuadre para compartir (foco_x / foco_y).
-- Porcentajes 0-100: 50/50 = centrado (como se veía hasta ahora).
alter table noticias add column if not exists web_foco_x smallint not null default 50
  check (web_foco_x between 0 and 100);
alter table noticias add column if not exists web_foco_y smallint not null default 50
  check (web_foco_y between 0 and 100);

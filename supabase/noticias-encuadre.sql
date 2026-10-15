-- Encuadre de la foto de la noticia en la imagen para compartir (historias, WhatsApp).
-- Porcentajes 0-100: 50/50 = centrado (como funcionaba hasta ahora).
-- No afecta cómo se ve la foto en la web.
alter table noticias add column if not exists foco_x smallint not null default 50
  check (foco_x between 0 and 100);
alter table noticias add column if not exists foco_y smallint not null default 50
  check (foco_y between 0 and 100);

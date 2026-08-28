-- Políticas de Storage.
-- Faltaba permiso de LECTURA sobre storage.buckets: el servicio de Storage
-- necesita poder ver la fila del bucket (vía RLS) antes de aceptar cualquier
-- operación sobre sus objetos, aunque el bucket sea público.

drop policy if exists "cualquiera ve los buckets" on storage.buckets;

create policy "cualquiera ve los buckets"
  on storage.buckets for select
  to authenticated, anon
  using (true);

-- Verificación
select policyname, cmd, roles from pg_policies where tablename = 'buckets' and schemaname = 'storage';

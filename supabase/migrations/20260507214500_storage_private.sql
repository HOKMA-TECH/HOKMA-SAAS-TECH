insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'tenant-private',
  'tenant-private',
  false,
  52428800,
  array['application/pdf','image/png','image/jpeg','image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;


create or replace function public.storage_path_tenant_id(p_name text)
returns uuid
language sql
immutable
as $$
  select nullif(split_part(p_name, '/', 1), '')::uuid;
$$;

create policy storage_objects_insert_tenant_member
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'tenant-private'
  and public.is_member_of_tenant(public.storage_path_tenant_id(name))
);

create policy storage_objects_select_tenant_member
on storage.objects
for select
to authenticated
using (
  bucket_id = 'tenant-private'
  and public.is_member_of_tenant(public.storage_path_tenant_id(name))
);

create policy storage_objects_delete_tenant_admin
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'tenant-private'
  and public.has_tenant_role(public.storage_path_tenant_id(name), array['administrador','diretor'])
);

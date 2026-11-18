-- ARDA 数据库迁移 0011：Storage Buckets 与访问策略
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', true, 5242880, array['image/png','image/jpeg','image/webp']),
  ('logos', 'logos', true, 5242880, array['image/png','image/jpeg','image/webp','image/svg+xml']),
  ('media', 'media', true, 52428800, array['image/png','image/jpeg','image/webp','video/mp4']),
  ('downloads', 'downloads', true, 52428800, array['application/pdf','application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document','image/png','image/jpeg']),
  ('applications', 'applications', false, 10485760, array['application/pdf','image/png','image/jpeg'])
on conflict (id) do nothing;

-- 公开桶：所有人可读，仅管理员可写
create policy "public read public buckets" on storage.objects
  for select using (bucket_id in ('avatars','logos','media','downloads'));

create policy "admin writes public buckets" on storage.objects
  for insert with check (
    bucket_id in ('avatars','logos','media','downloads') and public.has_permission('content.publish')
  );
create policy "admin updates public buckets" on storage.objects
  for update using (
    bucket_id in ('avatars','logos','media','downloads') and public.has_permission('content.publish')
  );
create policy "admin deletes public buckets" on storage.objects
  for delete using (
    bucket_id in ('avatars','logos','media','downloads') and public.has_permission('content.publish')
  );

-- applications 桶：私有，申请人可上传自己的证明文件，仅管理员可读取/删除
create policy "anyone can upload application documents" on storage.objects
  for insert with check (bucket_id = 'applications');
create policy "admin reads application documents" on storage.objects
  for select using (bucket_id = 'applications' and public.has_permission('applications.review'));
create policy "admin deletes application documents" on storage.objects
  for delete using (bucket_id = 'applications' and public.current_admin_role_key() = 'super_admin');

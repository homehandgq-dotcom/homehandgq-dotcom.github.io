-- ARDA 数据库迁移 0012：各界名人祝贺（congratulation_videos） + 协会刊物（publications）
-- ============================================================
-- 说明：
-- 1. 本迁移是纯新增（新建 2 张表 + 2 个新 Storage Bucket + 对应 RLS），
--    不修改任何既有表/桶，可在已执行过 0001～0011 的数据库上安全追加执行。
-- 2. 与 news_posts / events 等既有内容表不同，这两张新表对应的 Storage Bucket
--    （congratulations / publications）创建为 **私有桶**（public = false），
--    且刻意不为 storage.objects 配置任何 "匿名可读" 策略 —— 草稿视频/PDF
--    不会因为桶是公开桶而被任何人通过直链访问到。
--    前台已发布内容与后台预览，统一改为由服务端使用 Service Role 生成
--    短期有效的签名 URL（signed URL）按需下发，从应用层（而非存储层的匿名读策略）
--    保证"未发布内容不可公开访问"。管理员对草稿的预览，额外受 storage RLS 的
--    content.publish 权限校验（见下方 insert/update/delete 策略），数据库权限与
--    存储权限两层校验同时生效。

-- ---------- 1. 各界名人祝贺 congratulation_videos ----------

create table public.congratulation_videos (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,

  name_zh text not null,
  name_en text not null,
  title_zh text,
  title_en text,
  message_zh text,
  message_en text,

  -- 视频文件：存储桶内对象路径（非公开 URL），由服务端按需签发临时访问链接
  video_path text not null,
  video_mime_type text,
  video_size_bytes bigint,
  video_width int,
  video_height int,
  video_duration_seconds numeric,
  video_orientation text check (video_orientation in ('landscape', 'portrait', 'square')),

  -- 封面图：可为管理员自定义上传，也可由前端从视频首帧自动生成后上传
  cover_path text,
  cover_is_auto boolean not null default true,

  is_featured_home boolean not null default false,
  sort_order int not null default 0,

  status text not null default 'draft' check (status in ('draft', 'published', 'scheduled', 'unpublished')),
  published_at timestamptz,

  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_congratulation_videos_status_sort
  on public.congratulation_videos(status, sort_order);
create index idx_congratulation_videos_featured
  on public.congratulation_videos(is_featured_home, sort_order) where status = 'published';

create trigger trg_congratulation_videos_updated_at before update on public.congratulation_videos
  for each row execute function public.set_updated_at();

alter table public.congratulation_videos enable row level security;

create policy "public read published congratulation videos" on public.congratulation_videos
  for select using (status = 'published' or public.is_admin());
create policy "content admin writes congratulation videos" on public.congratulation_videos
  for all using (public.has_permission('content.publish')) with check (public.has_permission('content.publish'));

-- ---------- 2. 协会刊物 publications ----------

create table public.publications (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,

  name_zh text not null,
  name_en text not null,
  category text not null default 'handbook'
    check (category in ('handbook', 'journal', 'magazine', 'other')),
  issue_label_zh text,
  issue_label_en text,
  intro_zh text,
  intro_en text,

  -- PDF 文件：存储桶内对象路径；替换 PDF 时只更新本字段（指向新对象），
  -- 记录的 id / slug（也就是对外的永久阅读链接）保持不变。
  pdf_path text not null,
  pdf_size_bytes bigint,
  page_count int,

  cover_path text,
  cover_is_auto boolean not null default true,

  publish_date date,
  is_featured_home boolean not null default false,
  download_enabled boolean not null default true,
  sort_order int not null default 0,

  status text not null default 'draft' check (status in ('draft', 'published', 'scheduled', 'unpublished')),
  published_at timestamptz,

  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_publications_status_sort on public.publications(status, sort_order);
create index idx_publications_category on public.publications(category, sort_order);
create index idx_publications_featured
  on public.publications(is_featured_home, sort_order) where status = 'published';

create trigger trg_publications_updated_at before update on public.publications
  for each row execute function public.set_updated_at();

alter table public.publications enable row level security;

create policy "public read published publications" on public.publications
  for select using (status = 'published' or public.is_admin());
create policy "content admin writes publications" on public.publications
  for all using (public.has_permission('content.publish')) with check (public.has_permission('content.publish'));

-- ---------- 3. Storage Buckets（私有） ----------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'congratulations', 'congratulations', false, 524288000,
    array['video/mp4', 'video/quicktime', 'video/webm', 'image/png', 'image/jpeg', 'image/webp']
  ),
  (
    'publications', 'publications', false, 209715200,
    array['application/pdf', 'image/png', 'image/jpeg', 'image/webp']
  )
on conflict (id) do nothing;

-- 注意：这两个桶刻意不配置 "select"（匿名/公开读取）策略 —— 没有任何角色可以
-- 直接拼接 Storage 公开 URL 读取其中的文件，包括已发布内容。
-- 已发布内容的前台访问 / 管理员的草稿预览，统一经由服务端 Service Role
-- （绕过 RLS，但受应用层"是否已发布 / 是否具备 content.publish 权限"双重校验后）
-- 签发有效期较短的签名 URL，参见 lib/storage/signedUrl.ts。

create policy "admin uploads congratulation files" on storage.objects
  for insert with check (bucket_id = 'congratulations' and public.has_permission('content.publish'));
create policy "admin updates congratulation files" on storage.objects
  for update using (bucket_id = 'congratulations' and public.has_permission('content.publish'));
create policy "admin deletes congratulation files" on storage.objects
  for delete using (bucket_id = 'congratulations' and public.has_permission('content.delete'));

create policy "admin uploads publication files" on storage.objects
  for insert with check (bucket_id = 'publications' and public.has_permission('content.publish'));
create policy "admin updates publication files" on storage.objects
  for update using (bucket_id = 'publications' and public.has_permission('content.publish'));
create policy "admin deletes publication files" on storage.objects
  for delete using (bucket_id = 'publications' and public.has_permission('content.delete'));

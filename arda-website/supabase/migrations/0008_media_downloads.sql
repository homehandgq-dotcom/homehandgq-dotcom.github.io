-- ARDA 数据库迁移 0008：媒体文件与下载资源
-- ============================================================

create table public.media_files (
  id uuid primary key default gen_random_uuid(),
  bucket text not null,
  path text not null,
  url text not null,
  file_type text not null check (file_type in ('image','video','document','other')),
  size_bytes bigint,
  alt_zh text,
  alt_en text,
  caption_zh text,
  caption_en text,
  uploaded_by uuid references public.admin_users(id),
  created_at timestamptz not null default now()
);

create table public.downloads (
  id uuid primary key default gen_random_uuid(),
  title_zh text not null,
  title_en text not null,
  description_zh text,
  description_en text,
  file_url text not null,
  file_type text,
  file_size_bytes bigint,
  category text not null default 'general' check (
    category in ('industry_report','policy_update','restaurant_resource','member_resource','general')
  ),
  access_level text not null default 'public' check (access_level in ('public','member_only')),
  download_count int not null default 0,
  status text not null default 'draft' check (status in ('draft','published','scheduled','unpublished')),
  sort_order int not null default 0,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_downloads_updated_at before update on public.downloads
  for each row execute function public.set_updated_at();

alter table public.media_files enable row level security;
alter table public.downloads enable row level security;

create policy "public read media_files" on public.media_files for select using (true);
create policy "content admin writes media_files" on public.media_files
  for all using (public.has_permission('content.publish')) with check (public.has_permission('content.publish'));

create policy "public read published downloads" on public.downloads
  for select using (status = 'published' or public.is_admin());
create policy "content admin writes downloads" on public.downloads
  for all using (public.has_permission('content.publish')) with check (public.has_permission('content.publish'));

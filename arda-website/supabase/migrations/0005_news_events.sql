-- ARDA 数据库迁移 0005：新闻与活动
-- ============================================================

create table public.news_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  category_id uuid references public.news_categories(id) on delete set null,
  title_zh text not null,
  title_en text not null,
  excerpt_zh text,
  excerpt_en text,
  body_zh text,
  body_en text,
  cover_image text,
  gallery text[] not null default '{}',
  tags text[] not null default '{}',
  author text,
  source_zh text,
  source_en text,
  is_pinned boolean not null default false,
  view_count int not null default 0,
  seo_title_zh text,
  seo_title_en text,
  seo_description_zh text,
  seo_description_en text,
  status text not null default 'draft' check (status in ('draft','published','scheduled','unpublished')),
  published_at timestamptz,
  sort_order int not null default 0,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_news_posts_status_pub on public.news_posts(status, published_at desc);
create index idx_news_posts_search on public.news_posts using gin (
  (title_zh || ' ' || title_en || ' ' || coalesce(excerpt_zh,'') || ' ' || coalesce(excerpt_en,'')) gin_trgm_ops
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  category text not null default 'general' check (category in ('forum','training','delegation','exchange','general')),
  title_zh text not null,
  title_en text not null,
  summary_zh text,
  summary_en text,
  body_zh text,
  body_en text,
  start_at timestamptz not null,
  end_at timestamptz,
  timezone text not null default 'America/New_York',
  location_zh text,
  location_en text,
  map_lat double precision,
  map_lng double precision,
  host_zh text,
  host_en text,
  co_hosts_zh text,
  co_hosts_en text,
  cover_image text,
  gallery text[] not null default '{}',
  registration_deadline timestamptz,
  capacity int,
  event_status text not null default 'upcoming' check (event_status in ('upcoming','ongoing','past','cancelled')),
  recap_zh text,
  recap_en text,
  attachment_urls text[] not null default '{}',
  status text not null default 'draft' check (status in ('draft','published','scheduled','unpublished')),
  published_at timestamptz,
  sort_order int not null default 0,
  is_featured boolean not null default false,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_events_status_start on public.events(status, start_at desc);

create table public.event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  name text not null,
  email text not null,
  phone text,
  company text,
  headcount int not null default 1,
  notes text,
  status text not null default 'registered' check (status in ('registered','waitlisted','cancelled','attended')),
  created_at timestamptz not null default now()
);

create index idx_event_registrations_event on public.event_registrations(event_id);

create trigger trg_news_posts_updated_at before update on public.news_posts
  for each row execute function public.set_updated_at();
create trigger trg_events_updated_at before update on public.events
  for each row execute function public.set_updated_at();

-- ---------- RLS ----------
alter table public.news_posts enable row level security;
alter table public.events enable row level security;
alter table public.event_registrations enable row level security;

create policy "public read published news" on public.news_posts
  for select using (status = 'published' or public.is_admin());
create policy "content admin writes news" on public.news_posts
  for all using (public.has_permission('content.publish')) with check (public.has_permission('content.publish'));

create policy "public read published events" on public.events
  for select using (status = 'published' or public.is_admin());
create policy "content admin writes events" on public.events
  for all using (public.has_permission('content.publish')) with check (public.has_permission('content.publish'));

-- 活动报名：任何人可提交（限流/校验在应用层 Server Action 完成），
-- 但不可读取他人报名信息，只有管理员可查看名单。
create policy "anyone can register for events" on public.event_registrations
  for insert with check (true);
create policy "admin reads registrations" on public.event_registrations
  for select using (public.is_admin());
create policy "admin manages registrations" on public.event_registrations
  for update using (public.is_admin()) with check (public.is_admin());
create policy "admin deletes registrations" on public.event_registrations
  for delete using (public.is_admin());

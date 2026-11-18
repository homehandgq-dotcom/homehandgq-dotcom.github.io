-- ARDA 数据库迁移 0007：合作伙伴 / 页面 / 导航 / 站点设置 / 翻译字符串
-- ============================================================

create table public.partners (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('strategic','corporate','media','educational','government_community')),
  name_zh text not null,
  name_en text not null,
  logo_url text,
  website text,
  description_zh text,
  description_en text,
  sort_order int not null default 0,
  is_featured_home boolean not null default false,
  status text not null default 'draft' check (status in ('draft','published','scheduled','unpublished')),
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  "group" text not null check ("group" in ('about','legal','services','custom')),
  title_zh text not null,
  title_en text not null,
  body_zh text,
  body_en text,
  seo_title_zh text,
  seo_title_en text,
  seo_description_zh text,
  seo_description_en text,
  cover_image text,
  status text not null default 'draft' check (status in ('draft','published','scheduled','unpublished')),
  published_at timestamptz,
  sort_order int not null default 0,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique ("group", slug)
);

create table public.navigation_items (
  id uuid primary key default gen_random_uuid(),
  menu text not null check (menu in ('header','footer')),
  parent_id uuid references public.navigation_items(id) on delete cascade,
  label_zh text not null,
  label_en text not null,
  url text not null,
  mega_menu_group text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  opens_new_tab boolean not null default false
);

create table public.site_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value_json jsonb not null default '{}'::jsonb,
  description text
);

create table public.translations (
  id uuid primary key default gen_random_uuid(),
  namespace text not null,
  key text not null,
  locale text not null check (locale in ('zh','en')),
  value text not null,
  unique (namespace, key, locale)
);

create trigger trg_partners_updated_at before update on public.partners
  for each row execute function public.set_updated_at();
create trigger trg_pages_updated_at before update on public.pages
  for each row execute function public.set_updated_at();

alter table public.partners enable row level security;
alter table public.pages enable row level security;
alter table public.navigation_items enable row level security;
alter table public.site_settings enable row level security;
alter table public.translations enable row level security;

create policy "public read published partners" on public.partners
  for select using (status = 'published' or public.is_admin());
create policy "content admin writes partners" on public.partners
  for all using (public.has_permission('content.publish')) with check (public.has_permission('content.publish'));

create policy "public read published pages" on public.pages
  for select using (status = 'published' or public.is_admin());
create policy "content admin writes pages" on public.pages
  for all using (public.has_permission('content.publish')) with check (public.has_permission('content.publish'));

create policy "public read active navigation" on public.navigation_items
  for select using (is_active = true or public.is_admin());
create policy "content admin writes navigation" on public.navigation_items
  for all using (public.has_permission('content.publish')) with check (public.has_permission('content.publish'));

create policy "public read site_settings" on public.site_settings for select using (true);
create policy "content admin writes site_settings" on public.site_settings
  for all using (public.has_permission('content.publish')) with check (public.has_permission('content.publish'));

create policy "public read translations" on public.translations for select using (true);
create policy "content admin writes translations" on public.translations
  for all using (public.has_permission('content.publish')) with check (public.has_permission('content.publish'));

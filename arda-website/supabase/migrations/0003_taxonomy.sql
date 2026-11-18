-- ARDA 数据库迁移 0003：基础分类字典表
-- ============================================================

create table public.membership_types (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name_zh text not null,
  name_en text not null,
  description_zh text,
  description_en text,
  sort_order int not null default 0,
  is_active boolean not null default true
);

create table public.industries (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name_zh text not null,
  name_en text not null,
  sort_order int not null default 0
);

create table public.news_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_zh text not null,
  name_en text not null,
  sort_order int not null default 0
);

create table public.departments (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_zh text not null,
  name_en text not null,
  parent_department_id uuid references public.departments(id) on delete set null,
  sort_order int not null default 0
);

-- 通用 FAQ 表，按 group 复用于 membership / donation 等模块
create table public.faq_items (
  id uuid primary key default gen_random_uuid(),
  "group" text not null,
  question_zh text not null,
  question_en text not null,
  answer_zh text not null,
  answer_en text not null,
  sort_order int not null default 0
);

alter table public.membership_types enable row level security;
alter table public.industries enable row level security;
alter table public.news_categories enable row level security;
alter table public.departments enable row level security;
alter table public.faq_items enable row level security;

create policy "public read membership_types" on public.membership_types for select using (true);
create policy "public read industries" on public.industries for select using (true);
create policy "public read news_categories" on public.news_categories for select using (true);
create policy "public read departments" on public.departments for select using (true);
create policy "public read faq_items" on public.faq_items for select using (true);

create policy "content admin writes membership_types" on public.membership_types
  for all using (public.has_permission('content.publish')) with check (public.has_permission('content.publish'));
create policy "content admin writes industries" on public.industries
  for all using (public.has_permission('content.publish')) with check (public.has_permission('content.publish'));
create policy "content admin writes news_categories" on public.news_categories
  for all using (public.has_permission('content.publish')) with check (public.has_permission('content.publish'));
create policy "content admin writes departments" on public.departments
  for all using (public.has_permission('content.publish')) with check (public.has_permission('content.publish'));
create policy "content admin writes faq_items" on public.faq_items
  for all using (public.has_permission('content.publish')) with check (public.has_permission('content.publish'));

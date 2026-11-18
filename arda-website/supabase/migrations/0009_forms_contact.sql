-- ARDA 数据库迁移 0009：联系表单 / 订阅 / 捐赠赞助咨询
-- ============================================================

create table public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  type text not null default 'general' check (
    type in ('general','media','business','membership','chapter','donation')
  ),
  name text not null,
  email text not null,
  phone text,
  company text,
  chapter_id uuid references public.chapters(id) on delete set null,
  subject text,
  message text not null,
  status text not null default 'new' check (status in ('new','in_progress','resolved')),
  assigned_to uuid references public.admin_users(id),
  ip_address text,
  created_at timestamptz not null default now()
);

create index idx_contact_submissions_status on public.contact_submissions(status, created_at desc);

create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  locale_pref text not null default 'zh' check (locale_pref in ('zh','en')),
  is_confirmed boolean not null default false,
  subscribed_at timestamptz not null default now(),
  unsubscribed_at timestamptz
);

create table public.donations_or_sponsorship_inquiries (
  id uuid primary key default gen_random_uuid(),
  inquiry_type text not null default 'donation' check (
    inquiry_type in ('donation','corporate_sponsorship','event_sponsorship')
  ),
  name text not null,
  email text not null,
  phone text,
  company text,
  amount_range text,
  message text,
  status text not null default 'new' check (status in ('new','in_progress','resolved')),
  created_at timestamptz not null default now()
);

alter table public.contact_submissions enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.donations_or_sponsorship_inquiries enable row level security;

create policy "anyone can submit contact form" on public.contact_submissions
  for insert with check (true);
create policy "admin reads contact_submissions" on public.contact_submissions
  for select using (public.is_admin());
create policy "admin updates contact_submissions" on public.contact_submissions
  for update using (public.is_admin()) with check (public.is_admin());
create policy "admin deletes contact_submissions" on public.contact_submissions
  for delete using (public.current_admin_role_key() = 'super_admin');

create policy "anyone can subscribe" on public.newsletter_subscribers
  for insert with check (true);
create policy "admin reads subscribers" on public.newsletter_subscribers
  for select using (public.is_admin());
create policy "admin manages subscribers" on public.newsletter_subscribers
  for update using (public.is_admin()) with check (public.is_admin());
create policy "admin deletes subscribers" on public.newsletter_subscribers
  for delete using (public.is_admin());

create policy "anyone can submit donation inquiry" on public.donations_or_sponsorship_inquiries
  for insert with check (true);
create policy "admin reads donation inquiries" on public.donations_or_sponsorship_inquiries
  for select using (public.is_admin());
create policy "admin manages donation inquiries" on public.donations_or_sponsorship_inquiries
  for update using (public.is_admin()) with check (public.is_admin());
create policy "admin deletes donation inquiries" on public.donations_or_sponsorship_inquiries
  for delete using (public.current_admin_role_key() = 'super_admin');

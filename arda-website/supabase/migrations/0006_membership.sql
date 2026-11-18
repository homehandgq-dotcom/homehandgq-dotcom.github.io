-- ARDA 数据库迁移 0006：会员申请与正式会员
-- ============================================================

create sequence if not exists public.application_no_seq start 1;

create or replace function public.generate_application_no()
returns text
language plpgsql
as $$
declare
  next_val bigint;
begin
  next_val := nextval('public.application_no_seq');
  return 'ARDA-' || to_char(now(), 'YYYY') || '-' || lpad(next_val::text, 6, '0');
end;
$$;

create table public.member_applications (
  id uuid primary key default gen_random_uuid(),
  application_no text not null unique default public.generate_application_no(),
  status text not null default 'submitted' check (
    status in ('draft','submitted','under_review','more_info_required','approved','rejected','archived')
  ),

  -- 基本信息
  real_name text not null,
  english_name text,
  phone text not null,
  email text not null,
  company_name_zh text,
  company_name_en text,
  title text,
  membership_type_id uuid references public.membership_types(id),
  state text not null,
  city text not null,
  company_address text,
  company_website text,
  social_media text,

  -- 行业信息
  industry_id uuid references public.industries(id),
  business_type text,
  company_size text,
  store_count int,
  employee_count int,
  founded_year int,
  service_area text,
  bio text,
  desired_services text[] not null default '{}',
  desired_committee_ids uuid[] not null default '{}',
  desired_chapter_id uuid references public.chapters(id),
  referrer text,
  remarks text,

  -- 文件与确认
  logo_url text,
  avatar_url text,
  document_urls text[] not null default '{}',
  agree_privacy boolean not null default false,
  agree_contact boolean not null default false,
  confirm_accuracy boolean not null default false,
  e_signature text,

  -- 审核与元数据
  submitted_at timestamptz default now(),
  reviewed_by uuid references public.admin_users(id),
  reviewed_at timestamptz,
  internal_notes text,
  rejection_reason text,
  ip_address text,
  user_agent text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_member_applications_status on public.member_applications(status);
create index idx_member_applications_state on public.member_applications(state);
create index idx_member_applications_industry on public.member_applications(industry_id);
create index idx_member_applications_type on public.member_applications(membership_type_id);
create index idx_member_applications_created on public.member_applications(created_at desc);
create index idx_member_applications_email_lower on public.member_applications (lower(email));

create trigger trg_member_applications_updated_at before update on public.member_applications
  for each row execute function public.set_updated_at();

-- 防止 24 小时内同一邮箱重复提交（应用层也会做前置校验，这里作为数据库兜底约束）
create unique index uniq_application_email_recent
  on public.member_applications (lower(email))
  where status in ('submitted','under_review','more_info_required');

create table public.members (
  id uuid primary key default gen_random_uuid(),
  application_id uuid unique references public.member_applications(id) on delete set null,
  membership_type_id uuid not null references public.membership_types(id),
  display_name_zh text not null,
  display_name_en text not null,
  company_name_zh text,
  company_name_en text,
  logo_url text,
  city text,
  state text,
  industry_id uuid references public.industries(id),
  website text,
  is_public boolean not null default false,
  member_since date not null default current_date,
  status text not null default 'active' check (status in ('active','inactive','expired')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_members_public on public.members(is_public, status);
create index idx_members_state on public.members(state);

create trigger trg_members_updated_at before update on public.members
  for each row execute function public.set_updated_at();

alter table public.chapter_members
  add constraint chapter_members_member_id_fkey
  foreign key (member_id) references public.members(id) on delete cascade;

-- ---------- 状态查询 RPC：仅返回状态相关的非敏感字段 ----------
create or replace function public.lookup_application(p_application_no text, p_email text)
returns table (
  application_no text,
  status text,
  real_name text,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  rejection_reason text
)
language sql
stable
security definer
set search_path = public
as $$
  select a.application_no, a.status, a.real_name, a.submitted_at, a.reviewed_at,
         case when a.status = 'rejected' then a.rejection_reason else null end
  from public.member_applications a
  where a.application_no = p_application_no
    and lower(a.email) = lower(p_email);
$$;

grant execute on function public.lookup_application(text, text) to anon, authenticated;

-- ---------- RLS ----------
alter table public.member_applications enable row level security;
alter table public.members enable row level security;

-- 前台不允许直接 SELECT/INSERT member_applications（防止爬取个人信息、绕过校验）。
-- 提交表单与状态查询均通过服务端 Server Action（使用具备 INSERT 权限的策略 + 应用层限流）
-- 或上面的 lookup_application() SECURITY DEFINER 函数完成。
create policy "admin reads applications" on public.member_applications
  for select using (
    public.has_permission('applications.review')
    and (
      public.current_admin_role_key() <> 'chapter_admin'
      or desired_chapter_id = public.admin_assigned_chapter_id()
    )
  );
create policy "server role inserts applications" on public.member_applications
  for insert with check (true); -- 实际写入统一走 Server Action，使用具备 RLS bypass 的受控路径
create policy "admin updates applications" on public.member_applications
  for update using (public.has_permission('applications.review'))
  with check (public.has_permission('applications.review'));
create policy "super admin deletes applications" on public.member_applications
  for delete using (public.current_admin_role_key() = 'super_admin');

create policy "public reads public members" on public.members
  for select using (is_public = true and status = 'active');
create policy "membership admin reads all members" on public.members
  for select using (public.has_permission('applications.review'));
create policy "membership admin writes members" on public.members
  for all using (public.has_permission('applications.review'))
  with check (public.has_permission('applications.review'));

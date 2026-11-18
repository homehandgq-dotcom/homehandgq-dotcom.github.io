-- ARDA 数据库迁移 0002：角色、权限、后台管理员
-- ============================================================

create table public.roles (
  id uuid primary key default gen_random_uuid(),
  key text not null unique check (key in ('super_admin','content_admin','membership_admin','chapter_admin','viewer')),
  name_zh text not null,
  name_en text not null,
  description text
);

create table public.permissions (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  description text
);

create table public.role_permissions (
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);

-- admin_users.id 与 auth.users.id 一致（1:1），保存管理员的后台专属资料
create table public.admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role_id uuid not null references public.roles(id),
  assigned_chapter_id uuid, -- chapter_admin 专用；FK 约束在 chapters 表创建后补加
  is_active boolean not null default true,
  last_login_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_admin_users_role on public.admin_users(role_id);

-- ---------- 权限判定辅助函数（SECURITY DEFINER，供 RLS 策略调用） ----------

create or replace function public.current_admin_role_key()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select r.key
  from public.admin_users au
  join public.roles r on r.id = au.role_id
  where au.id = auth.uid() and au.is_active = true
  limit 1;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users au
    where au.id = auth.uid() and au.is_active = true
  );
$$;

create or replace function public.has_permission(perm_key text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users au
    join public.role_permissions rp on rp.role_id = au.role_id
    join public.permissions p on p.id = rp.permission_id
    where au.id = auth.uid() and au.is_active = true and p.key = perm_key
  )
  or public.current_admin_role_key() = 'super_admin';
$$;

create or replace function public.admin_assigned_chapter_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select assigned_chapter_id from public.admin_users where id = auth.uid();
$$;

alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.admin_users enable row level security;

create policy "roles readable by admins" on public.roles
  for select using (public.is_admin());
create policy "permissions readable by admins" on public.permissions
  for select using (public.is_admin());
create policy "role_permissions readable by admins" on public.role_permissions
  for select using (public.is_admin());

create policy "admin can read own record" on public.admin_users
  for select using (id = auth.uid());
create policy "super admin can read all admin_users" on public.admin_users
  for select using (public.current_admin_role_key() = 'super_admin');
create policy "super admin manages admin_users" on public.admin_users
  for all using (public.current_admin_role_key() = 'super_admin')
  with check (public.current_admin_role_key() = 'super_admin');

-- 写操作（新增/停用管理员、调整角色权限）一律通过服务端 service role 完成，
-- 避免普通管理员账号被盗后自我提权；因此 roles/permissions/role_permissions 不开放前端写策略。

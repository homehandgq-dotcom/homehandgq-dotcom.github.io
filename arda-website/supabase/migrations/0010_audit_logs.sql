-- ARDA 数据库迁移 0010：操作审计日志
-- ============================================================

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.admin_users(id),
  action text not null, -- 例如 application.status_change / content.delete / user.role_change / applications.export
  entity_table text not null,
  entity_id text,
  before_json jsonb,
  after_json jsonb,
  ip_address text,
  created_at timestamptz not null default now()
);

create index idx_audit_logs_entity on public.audit_logs(entity_table, entity_id);
create index idx_audit_logs_created on public.audit_logs(created_at desc);

alter table public.audit_logs enable row level security;

-- 只有服务端（service role）可写入，普通管理员账号即使被盗也无法篡改日志
create policy "admins read audit_logs" on public.audit_logs
  for select using (public.current_admin_role_key() in ('super_admin','viewer'));

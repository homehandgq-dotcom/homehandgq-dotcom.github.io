-- ARDA 数据库迁移 0001：扩展与通用辅助函数
-- ============================================================

create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

-- 通用 updated_at 自动更新触发器函数
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 通用内容发布状态枚举（用 text + check 约束而非原生 enum，方便后台无需迁移即可扩展）
-- status: draft | published | scheduled | unpublished

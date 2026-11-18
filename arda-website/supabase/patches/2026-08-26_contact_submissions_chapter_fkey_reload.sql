-- ============================================================
-- ARDA 内容补丁：2026-08-26（六）
-- 用途：跟之前"导航菜单"报错同一类问题的预防性修复——
--      contact_submissions.chapter_id 这个外键也是用 inline "references"
--      写法建的（没显式命名约束），跟 navigation_items.parent_id 当初的
--      写法一模一样，有同样的风险：约束名对不上，或者 PostgREST 接口缓存
--      没跟上，导致依赖这个外键关系的查询报错。
--      代码这边已经改成不依赖这个外键关系了（"联系与咨询"后台页面现在是
--      分两次查询、在代码里拼数据），所以就算不跑这个补丁，页面也能正常用；
--      这个补丁是为了让数据库结构本身更规范、以防其他地方以后用到这个关系。
--
-- 使用方法：登录 Supabase 控制台 → 左侧 SQL Editor → 新建查询 →
--          粘贴本文件全部内容 → Run。
-- ============================================================

begin;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'contact_submissions_chapter_id_fkey'
  ) then
    alter table public.contact_submissions
      add constraint contact_submissions_chapter_id_fkey
      foreign key (chapter_id) references public.chapters(id) on delete set null;
  end if;
end $$;

commit;

notify pgrst, 'reload schema';

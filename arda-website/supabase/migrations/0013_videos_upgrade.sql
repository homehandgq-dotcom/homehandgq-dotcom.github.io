-- ARDA 数据库迁移 0013：「各界名人祝贺」升级为「协会视频」综合栏目（含分类管理）
-- ============================================================
-- 背景：原「各界名人祝贺」(congratulation_videos) 升级为涵盖协会全部视频的
-- 综合栏目「协会视频 / ARDA 视界」，原「名人祝贺」变为其中一个可筛选的分类。
-- 本迁移复用并迁移原有 congratulation_videos 表及其全部既有数据（不新建并行
-- 的第二套视频系统），具体做法：
--   1) 新建 video_categories 分类字典表，并预置 5 个初始分类；
--   2) 对 congratulation_videos 做结构调整后改名为 videos：
--      - 新增 category_id（关联分类；原有数据统一归入"名人祝贺"分类）
--      - 新增 title_zh / title_en（视频标题，必填；原有数据以人物姓名回填，
--        后台可再精细化编辑）
--      - 原 name_zh/name_en（人物姓名）改名为 person_name_zh/person_name_en，
--        原 title_zh/title_en（人物职务）改名为 person_title_zh/person_title_en，
--        均放宽为选填，以便发布活动回顾、宣传片等没有单一人物的视频
--      - 原 message_zh/message_en（祝福语）改名为 intro_zh/intro_en（视频简介）
--      - 新增 publish_date（发布日期；原有数据以 published_at/created_at 回填）
--   3) Storage：新建私有桶 videos（替代 congratulations）并迁移存储策略；
--      旧 congratulations 桶的策略一并清理，桶本身留空保留（原因见文件下方说明，
--      Supabase 不允许用 SQL 直接删除 storage 桶/对象，需要去后台手动删除）。
-- 本迁移可在已执行 0001～0012 的数据库上安全追加执行；若 0012 之后尚未执行过
-- "grant select/insert/update/delete on congratulation_videos" 的权限修复，
-- 本迁移末尾也会重新声明一遍，确保升级后的 videos 表权限一定是完整的。

-- ---------- 1. 视频分类字典表 video_categories ----------

create table public.video_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_zh text not null,
  name_en text not null,
  description_zh text,
  description_en text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_video_categories_updated_at before update on public.video_categories
  for each row execute function public.set_updated_at();

alter table public.video_categories enable row level security;

create policy "public read video_categories" on public.video_categories for select using (true);
create policy "content admin writes video_categories" on public.video_categories
  for all using (public.has_permission('content.publish')) with check (public.has_permission('content.publish'));

-- 基础表级权限：仅有 RLS 策略不足以生效，必须显式 GRANT 角色的表级权限
-- （与迁移 0012 补充的 GRANT 语句同理，这里直接在建表迁移里一并声明，避免
-- 再次出现 "permission denied for table" 的问题）。
grant select on public.video_categories to anon, authenticated;
grant insert, update, delete on public.video_categories to authenticated;

insert into public.video_categories (slug, name_zh, name_en, description_zh, description_en, sort_order) values
  ('congratulations', '名人祝贺', 'Congratulations', '明星、知名人士及各界嘉宾的祝贺视频。', 'Congratulatory videos from celebrities, dignitaries and distinguished guests.', 1),
  ('event-highlights', '活动回顾', 'Event Highlights', '成立庆典、论坛、晚宴及其他活动视频。', 'Videos from our founding ceremony, forums, galas and other events.', 2),
  ('interviews', '人物访谈', 'Interviews', '会员、企业家及行业嘉宾访谈。', 'Interviews with members, entrepreneurs and industry guests.', 3),
  ('association-highlights', '协会风采', 'Association Highlights', '协会宣传片、日常交流、企业走访及发展记录。', 'Promotional videos, everyday exchanges, company visits and milestones.', 4),
  ('industry-insights', '行业分享', 'Industry Insights', '主题演讲、行业观点、培训及经验分享。', 'Keynote talks, industry perspectives, training and shared experience.', 5);

-- ---------- 2. congratulation_videos 结构调整并改名为 videos ----------

-- 2.1 既有"人物职务"列 title_zh/title_en 先改名，腾出 title_zh/title_en 这个
--     列名给新的"视频标题"概念使用（视频标题是本次新增的必填字段，人物职务是
--     原有的选填字段，两者含义不同，不能共用列名）。
alter table public.congratulation_videos rename column title_zh to person_title_zh;
alter table public.congratulation_videos rename column title_en to person_title_en;

-- 2.2 既有"人物姓名"列 name_zh/name_en 改名为 person_name_zh/person_name_en，
--     并放宽为选填（原来是 not null，必须先去掉约束再改名或改名后去约束，顺序均可）。
alter table public.congratulation_videos rename column name_zh to person_name_zh;
alter table public.congratulation_videos rename column name_en to person_name_en;
alter table public.congratulation_videos alter column person_name_zh drop not null;
alter table public.congratulation_videos alter column person_name_en drop not null;

-- 2.3 既有"祝福语"列 message_zh/message_en 改名为更通用的"视频简介" intro_zh/intro_en。
alter table public.congratulation_videos rename column message_zh to intro_zh;
alter table public.congratulation_videos rename column message_en to intro_en;

-- 2.4 新增列：分类、视频标题（先允许为空，回填后再加约束）、发布日期。
alter table public.congratulation_videos add column category_id uuid references public.video_categories(id) on delete restrict;
alter table public.congratulation_videos add column title_zh text;
alter table public.congratulation_videos add column title_en text;
alter table public.congratulation_videos add column publish_date date;

-- 2.5 回填已有数据：统一归入"名人祝贺"分类；视频标题暂以人物姓名回填（后台可
--     再精细化编辑为更合适的标题）；发布日期以 published_at 或 created_at 回填。
update public.congratulation_videos
set
  category_id = coalesce(category_id, (select id from public.video_categories where slug = 'congratulations')),
  title_zh = coalesce(title_zh, person_name_zh, '待补充标题'),
  title_en = coalesce(title_en, person_name_en, person_name_zh, 'Untitled'),
  publish_date = coalesce(publish_date, published_at::date, created_at::date);

-- 2.6 回填完成后补齐非空约束。
alter table public.congratulation_videos alter column category_id set not null;
alter table public.congratulation_videos alter column title_zh set not null;
alter table public.congratulation_videos alter column title_en set not null;

-- 2.7 表改名、索引/触发器/RLS 策略同步改名（均为同一对象重命名，底层数据、
--     外键关系、RLS 策略、已授予的表级权限均随对象 OID 保留，不受名称变化影响）。
alter table public.congratulation_videos rename to videos;
alter index idx_congratulation_videos_status_sort rename to idx_videos_status_sort;
alter index idx_congratulation_videos_featured rename to idx_videos_featured;
create index idx_videos_category on public.videos(category_id);
alter trigger trg_congratulation_videos_updated_at on public.videos rename to trg_videos_updated_at;
alter policy "public read published congratulation videos" on public.videos rename to "public read published videos";
alter policy "content admin writes congratulation videos" on public.videos rename to "content admin writes videos";

-- 2.8 保险起见重新声明一遍表级权限（见文件头说明）。
grant select on public.videos to anon, authenticated;
grant insert, update, delete on public.videos to authenticated;

-- ---------- 3. Storage：新建 videos 私有桶，迁移策略，删除旧 congratulations 桶 ----------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'videos', 'videos', false, 524288000,
  array['video/mp4', 'video/quicktime', 'video/webm', 'image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do nothing;

create policy "admin uploads video files" on storage.objects
  for insert with check (bucket_id = 'videos' and public.has_permission('content.publish'));
create policy "admin updates video files" on storage.objects
  for update using (bucket_id = 'videos' and public.has_permission('content.publish'));
create policy "admin deletes video files" on storage.objects
  for delete using (bucket_id = 'videos' and public.has_permission('content.delete'));

-- 旧 congratulations 桶：它的三条旧策略直接 drop 即可（policy 不受保护）；
-- 但 storage.objects / storage.buckets 这两张表受 Supabase 的 protect_delete()
-- 触发器保护，不允许用 SQL 直接 delete（会报 42501 "Direct deletion from
-- storage tables is not allowed. Use the Storage API instead."），所以旧桶
-- 本身不在这里删除——它现在没有任何代码再引用，留着也不影响任何功能，只是
-- 一个空桶（此前的权限问题已阻止了任何实际文件上传到这个桶）。如果想彻底清理，
-- 去 Supabase 后台 Storage 页面里手动删除 congratulations 这个桶即可（那里走的
-- 是 Storage API，不受此限制）。
drop policy if exists "admin uploads congratulation files" on storage.objects;
drop policy if exists "admin updates congratulation files" on storage.objects;
drop policy if exists "admin deletes congratulation files" on storage.objects;

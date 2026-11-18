-- ARDA 数据库迁移 0004：委员会 / 分会 / 领导团队（含循环外键的两阶段建表）
-- ============================================================

create table public.committees (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_zh text not null,
  name_en text not null,
  intro_zh text,
  intro_en text,
  responsibilities_zh text,
  responsibilities_en text,
  convener_person_id uuid, -- FK 稍后补加，引用 leadership_people
  annual_plan_zh text,
  annual_plan_en text,
  cover_image text,
  sort_order int not null default 0,
  status text not null default 'draft' check (status in ('draft','published','scheduled','unpublished')),
  published_at timestamptz,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.chapters (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  region_type text not null default 'state' check (region_type in ('state','city','overseas')),
  name_zh text not null,
  name_en text not null,
  intro_zh text,
  intro_en text,
  leader_person_id uuid, -- FK 稍后补加
  contact_email text,
  contact_phone text,
  address text,
  member_count_override int,
  cover_image text,
  map_lat double precision,
  map_lng double precision,
  sort_order int not null default 0,
  status text not null default 'draft' check (status in ('draft','published','scheduled','unpublished')),
  published_at timestamptz,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.leadership_people (
  id uuid primary key default gen_random_uuid(),
  name_zh text not null,
  name_en text not null,
  title_zh text not null,
  title_en text not null,
  governance_body text check (governance_body in
    ('general_assembly','board_of_directors','executive_council','secretariat','supervisory_board','advisory_committee','honorary')),
  department_id uuid references public.departments(id) on delete set null,
  committee_id uuid references public.committees(id) on delete set null,
  chapter_id uuid references public.chapters(id) on delete set null,
  avatar_url text,
  bio_zh text,
  bio_en text,
  sort_order int not null default 0,
  is_public boolean not null default true,
  show_contact boolean not null default false,
  contact_email text,
  contact_phone text,
  term_start date,
  term_end date,
  is_tba boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.committees
  add constraint committees_convener_person_id_fkey
  foreign key (convener_person_id) references public.leadership_people(id) on delete set null;

alter table public.chapters
  add constraint chapters_leader_person_id_fkey
  foreign key (leader_person_id) references public.leadership_people(id) on delete set null;

alter table public.admin_users
  add constraint admin_users_assigned_chapter_id_fkey
  foreign key (assigned_chapter_id) references public.chapters(id) on delete set null;

create table public.committee_members (
  id uuid primary key default gen_random_uuid(),
  committee_id uuid not null references public.committees(id) on delete cascade,
  person_id uuid not null references public.leadership_people(id) on delete cascade,
  role_zh text,
  role_en text,
  sort_order int not null default 0,
  unique (committee_id, person_id)
);

create table public.chapter_members (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid not null references public.chapters(id) on delete cascade,
  member_id uuid, -- FK 补加于 0006（members 表创建之后）
  joined_at timestamptz not null default now()
);

create trigger trg_committees_updated_at before update on public.committees
  for each row execute function public.set_updated_at();
create trigger trg_chapters_updated_at before update on public.chapters
  for each row execute function public.set_updated_at();
create trigger trg_leadership_people_updated_at before update on public.leadership_people
  for each row execute function public.set_updated_at();

-- ---------- RLS ----------
alter table public.committees enable row level security;
alter table public.chapters enable row level security;
alter table public.leadership_people enable row level security;
alter table public.committee_members enable row level security;
alter table public.chapter_members enable row level security;

create policy "public read published committees" on public.committees
  for select using (status = 'published' or public.is_admin());
create policy "public read published chapters" on public.chapters
  for select using (status = 'published' or public.is_admin());
create policy "public read public leadership" on public.leadership_people
  for select using (is_public = true or public.is_admin());
create policy "public read committee_members" on public.committee_members for select using (true);
create policy "public read chapter_members" on public.chapter_members for select using (true);

create policy "content admin writes committees" on public.committees
  for all using (public.has_permission('content.publish')) with check (public.has_permission('content.publish'));
create policy "chapter admin writes own chapter" on public.chapters
  for all using (
    public.has_permission('content.publish')
    and (public.current_admin_role_key() <> 'chapter_admin' or id = public.admin_assigned_chapter_id())
  )
  with check (
    public.has_permission('content.publish')
    and (public.current_admin_role_key() <> 'chapter_admin' or id = public.admin_assigned_chapter_id())
  );
create policy "content admin writes leadership_people" on public.leadership_people
  for all using (public.has_permission('content.publish')) with check (public.has_permission('content.publish'));
create policy "content admin writes committee_members" on public.committee_members
  for all using (public.has_permission('content.publish')) with check (public.has_permission('content.publish'));
create policy "content admin writes chapter_members" on public.chapter_members
  for all using (public.has_permission('content.publish')) with check (public.has_permission('content.publish'));

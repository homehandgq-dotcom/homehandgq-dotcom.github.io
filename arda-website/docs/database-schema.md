# 数据库设计 / Database Schema

PostgreSQL（Supabase）。完整可执行 SQL 见 `supabase/migrations/`。本文档给出表结构、关系与安全策略概览。所有面向公众展示的内容表均含 `title_zh/title_en`、`body_zh/body_en` 等双语字段；发布控制字段统一为 `status`(`draft|published|scheduled|unpublished`)、`published_at`、`sort_order`、`is_featured`、`created_by`、`created_at`、`updated_at`。

## 1. 认证与权限
- **roles**(id, key UNIQUE, name_zh, name_en, description) — super_admin/content_admin/membership_admin/chapter_admin/viewer
- **permissions**(id, key UNIQUE, description) — 例：`applications.export`, `content.publish`, `users.manage`
- **role_permissions**(role_id FK→roles, permission_id FK→permissions, PK 复合)
- **admin_users**(id UUID PK = `auth.users.id`, email, full_name, role_id FK→roles, assigned_chapter_id FK→chapters NULL, is_active, last_login_at, created_at)

## 2. 会员体系
- **membership_types**(id, key UNIQUE, name_zh, name_en, description_zh, description_en, sort_order, is_active) — founding/corporate/individual/professional/partner/honorary
- **industries**(id, key UNIQUE, name_zh, name_en, sort_order)
- **member_applications**(id, application_no UNIQUE 自动生成如 `ARDA-2026-000123`, status, 真实姓名, 英文姓名, 手机, 邮箱, 公司中英文名, 职位, membership_type_id FK, state, city, company_address, company_website, social_media, industry_id FK, business_type, company_size, store_count, employee_count, founded_year, service_area, bio, desired_services text[], desired_committee_ids uuid[], desired_chapter_id FK, referrer, remarks, logo_url, avatar_url, document_urls text[], agree_privacy bool, agree_contact bool, confirm_accuracy bool, e_signature, submitted_at, reviewed_by FK→admin_users, reviewed_at, internal_notes, rejection_reason, ip_address, user_agent, created_at, updated_at)
- **members**(id, application_id FK→member_applications UNIQUE NULL, membership_type_id FK, 公开展示字段：display_name_zh/en, company_name_zh/en, logo_url, city, state, industry_id FK, website, is_public bool, member_since, status(`active|inactive|expired`), created_at) — 仅审批通过后由后台"转为正式会员"生成，公开名录只读此表且仅 `is_public=true` 行

## 3. 委员会
- **committees**(id, slug UNIQUE, name_zh, name_en, intro_zh, intro_en, responsibilities_zh, responsibilities_en, convener_person_id FK→leadership_people, annual_plan_zh, annual_plan_en, cover_image, sort_order, status)
- **committee_members**(id, committee_id FK, person_id FK→leadership_people, role_zh, role_en, sort_order)

## 4. 分会与全球网络
- **chapters**(id, slug UNIQUE, region_type(`state|city|overseas`), name_zh, name_en, intro_zh, intro_en, leader_person_id FK→leadership_people, contact_email, contact_phone, address, member_count_override int NULL, cover_image, map_lat, map_lng, sort_order, status)
- **chapter_members**(id, chapter_id FK, member_id FK→members, joined_at)

## 5. 领导团队 / 组织
- **departments**(id, slug UNIQUE, name_zh, name_en, parent_department_id FK self NULL, sort_order)
- **leadership_people**(id, name_zh, name_en, title_zh, title_en, governance_body(`general_assembly|board_of_directors|executive_council|secretariat|supervisory_board|advisory_committee|honorary`), department_id FK NULL, committee_id FK NULL, chapter_id FK NULL, avatar_url, bio_zh, bio_en, sort_order, is_public bool, show_contact bool, contact_email, contact_phone, term_start date, term_end date, is_tba bool DEFAULT false)

## 6. 新闻与媒体
- **news_categories**(id, slug UNIQUE, name_zh, name_en, sort_order) — association-news/industry-news/press-release/media-coverage
- **news_posts**(id, slug UNIQUE, category_id FK, title_zh, title_en, excerpt_zh, excerpt_en, body_zh, body_en, cover_image, gallery text[], tags text[], author, source_zh, source_en, is_pinned, view_count, seo_title_zh/en, seo_description_zh/en, status, published_at, sort_order)

## 7. 活动
- **events**(id, slug UNIQUE, category(`forum|training|delegation|exchange|general`), title_zh, title_en, summary_zh, summary_en, body_zh, body_en, start_at timestamptz, end_at timestamptz, timezone, location_zh, location_en, map_lat, map_lng, host_zh, host_en, co_hosts_zh, co_hosts_en, cover_image, gallery text[], registration_deadline, capacity int NULL, registration_url_or_form bool, event_status(`upcoming|ongoing|past|cancelled`), recap_zh, recap_en, attachment_urls text[], status, published_at, sort_order, is_featured)
- **event_registrations**(id, event_id FK, name, email, phone, company, headcount int DEFAULT 1, notes, status(`registered|waitlisted|cancelled|attended`), created_at)

## 8. 合作伙伴
- **partners**(id, category(`strategic|corporate|media|educational|government_community`), name_zh, name_en, logo_url, website, description_zh, description_en, sort_order, is_featured_home, status)

## 9. 页面 / 导航 / 站点设置
- **pages**(id, slug UNIQUE, group(`about|legal|services|custom`), title_zh, title_en, body_zh, body_en, seo_title_zh/en, seo_description_zh/en, cover_image, status, published_at, sort_order)
- **navigation_items**(id, menu(`header|footer`), parent_id FK self NULL, label_zh, label_en, url, mega_menu_group, sort_order, is_active, opens_new_tab)
- **site_settings**(id, key UNIQUE, value_json jsonb, description) — 首页统计数字、联系方式、社交链接、SEO 默认值等键值配置，后台单页表单编辑
- **translations**(id, namespace, key, locale, value) — UI 静态文案（按钮、标签等）双语字符串表，供无法直接改代码的措辞做后台维护

## 10. 媒体与下载
- **media_files**(id, bucket, path, url, file_type, size_bytes, alt_zh, alt_en, uploaded_by FK, created_at)
- **downloads**(id, title_zh, title_en, description_zh, description_en, file_url, file_type, file_size_bytes, category(`industry_report|policy_update|restaurant_resource|member_resource|general`), access_level(`public|member_only`), download_count, status, sort_order)

## 11. 表单与联系
- **contact_submissions**(id, type(`general|media|business|membership|chapter|donation`), name, email, phone, company, chapter_id FK NULL, subject, message, status(`new|in_progress|resolved`), assigned_to FK→admin_users NULL, ip_address, created_at)
- **newsletter_subscribers**(id, email UNIQUE, locale_pref, is_confirmed, subscribed_at, unsubscribed_at NULL)
- **donations_or_sponsorship_inquiries**(id, inquiry_type(`donation|corporate_sponsorship|event_sponsorship`), name, email, phone, company, amount_range, message, status, created_at)

## 12. 审计
- **audit_logs**(id, actor_id FK→admin_users, action, entity_table, entity_id, before_json jsonb, after_json jsonb, ip_address, created_at) — 关键写操作（状态变更、删除、导出、角色变更）均记录

## 13. 外键关系摘要
`member_applications.membership_type_id→membership_types.id`；`member_applications.industry_id→industries.id`；`member_applications.desired_chapter_id→chapters.id`；`members.application_id→member_applications.id`；`committee_members.{committee_id,person_id}`；`chapter_members.{chapter_id,member_id}`；`leadership_people.{department_id,committee_id,chapter_id}` 均可 NULL（一人可能只属于治理机构不属于具体委员会/分会）；`news_posts.category_id→news_categories.id`；`admin_users.role_id→roles.id`；`admin_users.assigned_chapter_id→chapters.id`（chapter_admin 用）。

## 14. Row Level Security 策略要点
- 所有表默认 `ENABLE ROW LEVEL SECURITY`。
- 公开只读表（`news_posts`, `events`, `committees`, `chapters`, `leadership_people`, `partners`, `pages`, `downloads` 等）：`SELECT` 策略要求 `status = 'published'`（或 `is_public = true`）方可被 `anon`/`authenticated` 角色读取；写操作仅 `service_role`（服务端）或匹配角色的 `admin_users` 通过自定义 `is_admin_with_permission(permission_key)` SQL 函数放行。
- `member_applications`：禁止 `anon` 直接 `SELECT`（防止爬取个人信息）；插入仅允许经服务端 Server Action（使用 service role，绕过 RLS，并在应用层做校验/限流）；状态查询走专用 RPC 函数 `lookup_application(application_no, email)`，仅返回状态字段，不返回敏感信息。
- `members` 公开视图仅暴露 `is_public=true` 的展示字段，真实联系方式永不通过公开 API 返回。
- `contact_submissions` / `donations_or_sponsorship_inquiries` / `newsletter_subscribers`：仅 `INSERT` 对匿名开放（限流+校验），`SELECT/UPDATE/DELETE` 仅管理员。
- `audit_logs`：仅 `service_role` 写入，`super_admin`/`viewer` 只读。
- 所有管理端写操作也在 Server Action 层再次校验角色，不依赖前端隐藏按钮。

## 15. Storage Buckets
`avatars`(公开读，会员/人员头像)、`logos`(公开读，公司/合作伙伴 Logo)、`media`(公开读，新闻/活动图片视频)、`downloads`(按 `access_level` 走签名 URL 或公开)、`applications`(私有，申请人上传的名片/证明文件，仅管理员可读，签名 URL 短期有效)。

## 16. 种子数据范围（`supabase/seed.sql`）
- roles/permissions/role_permissions 基础集
- membership_types 6 类、industries 常见分类
- committees 6 个、chapters 11 个（NY/CA/TX/FL/NJ/IL/WA/Boston/Las Vegas/Hawaii/Overseas）
- leadership_people 按用户提供的初始名单录入（含"待定"占位）
- news_categories、示例 news_posts 2-3 条（占位内容，非虚构成就数据）
- site_settings 首页统计数字占位（如 `{"label_zh":"会员企业","label_zh":"...","value":0}` 结构，管理员可改）
- 一个 super_admin 引导说明（实际管理员通过 Supabase Auth 创建后手动关联 `admin_users`，见 README）

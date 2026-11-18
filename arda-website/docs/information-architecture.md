# ARDA 网站信息架构 / Information Architecture

American Restaurant Development Association (美国餐饮业发展协会, ARDA)

## 1. 技术方案总览

| 层 | 选型 | 说明 |
|---|---|---|
| 前端框架 | Next.js 14+ (App Router, RSC) | 支持路由分组、并行数据获取、SEO metadata API |
| 语言 | TypeScript (strict) | 全站类型安全 |
| 样式 | Tailwind CSS + 设计令牌 | 见 `docs/design-system.md` |
| 数据库 | PostgreSQL (Supabase) | 关系型、支持 RLS |
| 认证 | Supabase Auth (邮箱+密码, 后台专用) | 会员申请人不需要账号，用编号+邮箱查询 |
| 存储 | Supabase Storage (buckets: `avatars`, `logos`, `media`, `downloads`, `event-covers`) | 分桶管理不同用途文件 |
| 表单 | React Hook Form + Zod | 前端校验 + 服务端二次校验 |
| 富文本 | Tiptap | 新闻/活动/页面正文 |
| 图表 | Recharts | 后台仪表盘 |
| 数据导出 | `papaparse` (CSV) / `exceljs` (Excel) | 服务端生成，仅授权管理员可用 |
| 部署 | Vercel（前台+后台同一 Next.js App）+ Supabase（数据库/认证/存储） | |

前台（`/(site)`）与后台（`/admin`）在同一 Next.js 项目内以路由分组彻底隔离：不同布局、不同数据访问权限、后台默认 `robots: noindex` 且被中间件强制要求登录会话。也可在需要时把 `/admin` 拆分为独立 Next.js 项目部署到子域名 `admin.ardaus.org`，二者共享同一 Supabase 后端与 `packages/` 共享代码（本项目已按 workspace 思路组织 `lib/`，具备拆分条件）。

## 2. 路由清单（多页面，非单页）

所有前台路径均以 `/{locale}` 为前缀，`locale ∈ {zh, en}`，默认 `zh`（协会主要服务华人餐饮，第一阶段），语言切换保留在当前页面。

### 2.1 首页
- `/{locale}` 首页

### 2.2 About Us 关于我们（`/about/*`）
- `/{locale}/about` 协会介绍
- `/{locale}/about/mission-vision` 使命与愿景
- `/{locale}/about/history` 发展历程
- `/{locale}/about/leadership` 协会领导
- `/{locale}/about/board-of-directors` 董事局
- `/{locale}/about/executive-council` 执行理事会
- `/{locale}/about/advisory-committee` 顾问委员会
- `/{locale}/about/supervisory-board` 监事会
- `/{locale}/about/organization-structure` 组织架构
- `/{locale}/about/bylaws` 协会章程
- `/{locale}/about/governance` 治理与透明度

### 2.3 News & Media 新闻与媒体（`/news/*`）
- `/{locale}/news` 新闻总览（分类筛选：协会新闻/行业资讯/新闻稿/媒体报道）
- `/{locale}/news/[slug]` 新闻详情
- `/{locale}/news/gallery` 图片中心
- `/{locale}/news/videos` 视频中心

### 2.4 Programs & Events 项目与活动（`/events/*`）
- `/{locale}/events` 活动总览（即将举行 / 往届 / 论坛峰会 / 培训教育 / 商务考察 / 国际交流 筛选）
- `/{locale}/events/[slug]` 活动详情（含报名）

### 2.5 Association Services 协会服务（`/services/*`）
- `/{locale}/services` 服务总览
- `/{locale}/services/[slug]`：business-development, brand-franchise, supply-chain, technology-ai, capital-investment, legal-policy, training-talent, international-cooperation, media-promotion

### 2.6 Committees 专业委员会（`/committees/*`）
- `/{locale}/committees` 总览
- `/{locale}/committees/[slug]`：branding-franchise, supply-chain, technology-ai, capital-investment, legal-policy, next-gen-entrepreneurship

### 2.7 Chapters & Global Network（`/chapters/*`）
- `/{locale}/chapters` 分会总览
- `/{locale}/chapters/[slug]` 分会详情（后台可新增，非枚举死数据）
- `/{locale}/chapters/alliances` 行业联盟
- `/{locale}/chapters/international-partners` 国际合作伙伴
- `/{locale}/chapters/global-network` 全球网络

### 2.8 Membership 会员中心（`/membership/*`）
- `/{locale}/membership` Why Join
- `/{locale}/membership/types` 会员类别
- `/{locale}/membership/benefits` 会员权益
- `/{locale}/membership/apply` 申请入会（表单）
- `/{locale}/membership/apply/success` 提交成功页
- `/{locale}/membership/directory` 会员名录（仅展示已批准、公开授权的会员）
- `/{locale}/membership/faq` 常见问题
- `/{locale}/membership/status` 申请状态查询（编号+邮箱）

### 2.9 Partners 合作伙伴
- `/{locale}/partners` 分类展示（战略/企业/媒体/教育/政府与社区）

### 2.10 Donation 捐赠支持
- `/{locale}/donate`

### 2.11 Resources 资源中心
- `/{locale}/resources` 分类：行业报告/政策更新/餐饮资源/文件下载/会员资源（会员资源前台标注"需会员权限"，下载前需登录/申请）

### 2.12 Contact 联系我们
- `/{locale}/contact`

### 2.13 Legal 法律页面
- `/{locale}/legal/privacy-policy`
- `/{locale}/legal/terms-of-use`
- `/{locale}/legal/cookie-policy`
- `/{locale}/legal/accessibility-statement`
- `/{locale}/legal/conflict-of-interest`
- `/{locale}/legal/financial-transparency`
- `/{locale}/legal/disclaimer`

### 2.14 系统页
- `/{locale}/search` 全站搜索
- `/{locale}/not-found`（404）
- `/sitemap.xml`（`app/sitemap.ts`，动态生成）
- `/robots.txt`（`app/robots.ts`）

### 2.15 后台管理系统 `/admin/*`（不受 locale 前缀影响，独立于前台）
- `/admin/login` 登录
- `/admin` Dashboard 总览
- `/admin/applications` 会员申请管理列表
- `/admin/applications/[id]` 申请详情/审核
- `/admin/members` 正式会员管理
- `/admin/content/news` … `/admin/content/[entity]`（通用内容管理：news, events, committees, chapters, leadership, partners, pages, downloads, media）
- `/admin/content/[entity]/new`、`/admin/content/[entity]/[id]`
- `/admin/navigation` 导航菜单管理
- `/admin/site-settings` 首页数字/联系方式/社交链接/SEO 默认值
- `/admin/contact-submissions` 联系表单/捐赠咨询
- `/admin/newsletter` 订阅名单
- `/admin/users` 管理员与角色（仅 Super Admin）
- `/admin/audit-log` 操作日志（Super Admin / Viewer 只读）

## 3. 用户角色

**前台**：匿名访客（默认）；已批准会员目前不设专属登录门户（第一阶段），资源中心"会员资源"通过申请编号校验或后续扩展会员登录。

**后台角色（`roles` 表）**：
1. `super_admin` — 全部权限
2. `content_admin` — 新闻/活动/委员会/分会/领导/合作伙伴/页面/媒体的增删改
3. `membership_admin` — 会员申请的查看/审核/导出，会员名录管理
4. `chapter_admin` — 仅其 `assigned_chapter_id` 范围内的分会内容与该分会相关的会员申请
5. `viewer` — 只读 Dashboard 与统计

细粒度权限存于 `permissions` + `role_permissions`，中间件与 Server Action 双重校验（不仅前端隐藏按钮）。

## 4. 组件结构（前台）

```
app/[locale]/(site)/layout.tsx        # Header + Footer + Breadcrumb slot
components/site/header/               # StickyHeader, MegaMenu, MobileNav, LanguageSwitcher, SearchBox
components/site/footer/               # FooterColumns, NewsletterForm, SocialLinks
components/site/sections/             # Hero, StatsBand, MissionGrid, NewsPreview, EventsPreview,
                                       # CommitteesGrid, ChaptersMap, MembershipValue, PartnersLogos, CTASection
components/ui/                        # Button, Card, Badge, Section, Container, Tabs, Pagination,
                                       # EmptyState, ErrorState, Skeleton/Loading, RichTextRenderer
components/forms/                     # MembershipApplicationForm, ContactForm, NewsletterForm, EventRegistrationForm
```

## 5. 组件结构（后台）

```
app/admin/layout.tsx                  # AuthGuard + Sidebar + Topbar
app/admin/(dashboard)/page.tsx        # StatCards + Charts (Recharts)
app/admin/applications/*              # 专用会员申请表格/详情（业务流程特殊，非通用CRUD）
app/admin/content/[entity]/*          # 通用内容 CRUD：由 lib/admin/entity-registry.ts 驱动
components/admin/EntityTable.tsx      # 通用列表：搜索/筛选/排序/分页/批量操作/导出
components/admin/EntityForm.tsx       # 通用表单：由字段 schema 渲染（含中英字段、富文本、图片上传、排序、发布状态）
components/admin/charts/*             # StatCard, LineChartCard, BarChartCard, PieChartCard
lib/admin/entity-registry.ts          # 每种内容类型的字段定义、校验 schema、权限要求（集中数据结构，扩展新内容类型只需加一条配置）
```

这一"实体注册表 + 通用表格/表单"模式是满足"以后新增内容类型不需要改多处文件"的核心手段：News、Events、Committees、Chapters、Leadership、Partners、Pages、Downloads 共用同一套 UI 组件与服务端 action，仅数据结构与字段配置不同。

## 6. 开发步骤（执行顺序）

1. 数据库 Schema + RLS + Seed（`supabase/migrations`）
2. Supabase 客户端与中间件（服务端/浏览器端分离，Service Role Key 仅服务端使用）
3. i18n 路由与字典系统
4. 设计系统与共享 UI（Header/Footer/基础组件）
5. 前台页面（数据驱动，非硬编码）
6. 会员申请表单 + Server Action 写入数据库 + 邮件确认（预留 provider 接口）
7. 后台认证与 RBAC 中间件
8. 后台 Dashboard 图表
9. 后台会员申请管理
10. 后台通用内容 CRUD（news/events/committees/chapters/leadership/partners/pages/downloads/navigation/site-settings）
11. 构建校验、TypeScript 检查、（可选）本地 Postgres 验证迁移与种子数据
12. README 与部署手册

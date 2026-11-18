import "server-only";
import type { Role } from "@/lib/supabase/types";

/**
 * 通用内容管理注册表（Entity Registry）
 * ------------------------------------------------------------------
 * News / Events / Committees / Chapters / Leadership / Partners / Pages / Downloads
 * 这 8 类内容共用同一套后台 列表 / 新建 / 编辑 页面与同一套 Server Action，
 * 差异完全由本文件的「字段声明」驱动 —— 新增一种内容类型时，只需要在这里
 * 追加一份 EntityConfig，不需要新建控制器/页面文件。
 *
 * bilingual 字段：key 为不带 _zh/_en 后缀的基名，实际存储在数据库中的
 * `${key}_zh` / `${key}_en` 两列；表单据此自动渲染中/英两个输入框。
 */

export type FieldType =
  | "text"
  | "textarea"
  | "richtext"
  | "number"
  | "checkbox"
  | "select"
  | "date"
  | "datetime"
  | "image"
  | "file"
  | "url"
  | "slug"
  | "tags"
  | "multiselect"
  // 下面三种为「各界名人祝贺」「协会刊物」两个新内容类型新增：均为私有 Storage 桶
  // （见迁移 0012），上传后只保存对象路径（而非公开 URL），预览时由后台专用接口
  // 临时签发短期有效的签名 URL。
  | "video" // 可恢复（TUS）直传视频 + 自动提取宽高/时长/方向，渲染为 VideoUploadField
  | "pdf" // 可恢复（TUS）直传 PDF + 自动提取总页数/首页封面，渲染为 PdfUploadField
  | "private_image" // 私有桶内的封面图（自定义上传，优先于自动生成封面）
  // 不渲染任何输入控件，仅用于让「视频/PDF 上传组件通过 setMany() 一次性写入的
  // 元数据列」（宽高、时长、方向、MIME、字节数、是否自动生成封面等）同样被
  // EntityForm 的 initState / admin-entities 的 buildPayload 收录——这两处都是
  // 按 config.fields 遍历来决定"读哪些列 / 存哪些列"，元数据列必须在这里登记一份
  // 才会被保存，否则上传组件写入的 React state 会在提交时被静默丢弃。
  | "hidden";

export interface FieldOption {
  value: string;
  label: string;
}

export interface FieldConfig {
  key: string;
  label: string;
  type: FieldType;
  bilingual?: boolean;
  required?: boolean;
  helpText?: string;
  /** 关联表下拉选项，对应 loadRelationOptions() 返回 map 的 key */
  optionsKey?: string;
  /** 固定枚举下拉选项 */
  staticOptions?: FieldOption[];
  fullWidth?: boolean;
  placeholder?: string;
  /** image/file 字段：限制上传的文件类型，如 "image/png" */
  accept?: string;
  /** 文件类型限制的提示文案，如 "仅支持 PNG 格式" */
  acceptLabel?: string;
  /** "video" / "pdf" / "private_image" 专用：对应的私有 Storage Bucket 名称 */
  bucket?: "videos" | "publications";
  /** "hidden" 专用：底层数据库列的真实类型，决定 initState / coerceValue 如何转换该值 */
  valueKind?: "number" | "boolean" | "text";
}

export interface ListColumn {
  key: string;
  label: string;
}

export interface EntityConfig {
  key: string; // URL slug，如 "news"
  table: string; // 数据库表名
  labelZh: string;
  labelEn: string;
  fields: FieldConfig[];
  listColumns: ListColumn[];
  hasStatus: boolean;
  /** 该表是否有 published_at 列，发布时自动填充发布时间。默认为 true（跟随
   * hasStatus）；像 partners、downloads 这类表没有这一列的，显式设为 false，
   * 否则保存时会报 "Could not find the 'published_at' column" */
  hasPublishedAt?: boolean;
  hasSlug: boolean;
  hasSortOrder: boolean;
  defaultOrderBy: string;
  searchColumns: string[]; // 用于列表页关键词搜索（ilike）
  selectQuery: string; // Supabase select() 语句，含关联表字段
  relations: string[]; // 需要预加载的关联选项（对应 optionsKey）
  titleField: string; // 列表/表单标题展示用字段（不含 _zh 后缀）
  chapterScopedColumn?: string; // chapter_admin 仅可管理自己分会时，对应的列（当前仅 chapters.id 自身）
  allowedRoles: Role["key"][]; // 可访问此内容类型管理页面的角色
}

const CONTENT_STATUS_OPTIONS: FieldOption[] = [
  { value: "draft", label: "草稿 Draft" },
  { value: "published", label: "已发布 Published" },
  { value: "scheduled", label: "定时发布 Scheduled" },
  { value: "unpublished", label: "已下线 Unpublished" },
];

export const entityRegistry: Record<string, EntityConfig> = {
  news: {
    key: "news",
    allowedRoles: ["super_admin", "content_admin", "chapter_admin"],
    table: "news_posts",
    labelZh: "新闻资讯",
    labelEn: "News",
    hasStatus: true,
    hasSlug: true,
    hasSortOrder: true,
    defaultOrderBy: "created_at",
    searchColumns: ["title_zh", "title_en", "slug"],
    selectQuery: "*, category:news_categories(name_zh,name_en)",
    relations: ["news_categories", "chapters"],
    titleField: "title",
    fields: [
      { key: "category_id", label: "分类", type: "select", optionsKey: "news_categories" },
      {
        key: "chapter_id",
        label: "所属分会（留空 = 总会新闻，全站展示；选了某个分会则只在该分会详情页展示）",
        type: "select",
        optionsKey: "chapters",
      },
      { key: "title", label: "标题", type: "text", bilingual: true, required: true },
      { key: "slug", label: "URL Slug", type: "slug", required: true },
      { key: "excerpt", label: "摘要", type: "textarea", bilingual: true },
      { key: "body", label: "正文", type: "richtext", bilingual: true, fullWidth: true },
      { key: "cover_image", label: "封面图", type: "image" },
      {
        key: "video_url",
        label: "文章顶部视频（可选——上传视频文件或粘贴视频直链，文章详情页会在最上面播放这段视频，取代封面图；留空则跟以前一样只显示封面图）",
        type: "file",
        accept: "video/mp4",
        acceptLabel: "仅支持 MP4 格式视频",
      },
      { key: "gallery", label: "图集（每行一个链接）", type: "tags" },
      { key: "tags", label: "标签（逗号分隔）", type: "tags" },
      { key: "author", label: "作者", type: "text" },
      { key: "source", label: "来源", type: "text", bilingual: true },
      { key: "is_pinned", label: "首页置顶", type: "checkbox" },
      { key: "seo_title", label: "SEO 标题", type: "text", bilingual: true },
      { key: "seo_description", label: "SEO 描述", type: "textarea", bilingual: true },
      { key: "status", label: "状态", type: "select", staticOptions: CONTENT_STATUS_OPTIONS, required: true },
      { key: "published_at", label: "发布时间", type: "datetime" },
      { key: "sort_order", label: "排序权重", type: "number" },
    ],
    listColumns: [
      { key: "title_zh", label: "标题" },
      { key: "category", label: "分类" },
      { key: "status", label: "状态" },
      { key: "is_pinned", label: "置顶" },
      { key: "published_at", label: "发布时间" },
    ],
  },

  events: {
    key: "events",
    allowedRoles: ["super_admin", "content_admin", "chapter_admin"],
    table: "events",
    labelZh: "活动",
    labelEn: "Events",
    hasStatus: true,
    hasSlug: true,
    hasSortOrder: true,
    defaultOrderBy: "start_at",
    searchColumns: ["title_zh", "title_en", "slug"],
    selectQuery: "*",
    relations: ["chapters", "committees"],
    titleField: "title",
    fields: [
      {
        key: "category",
        label: "活动类别",
        type: "select",
        required: true,
        staticOptions: [
          { value: "forum", label: "论坛 Forum" },
          { value: "training", label: "培训 Training" },
          { value: "delegation", label: "考察团 Delegation" },
          { value: "exchange", label: "交流 Exchange" },
          { value: "general", label: "综合 General" },
        ],
      },
      {
        key: "chapter_id",
        label: "所属分会（留空 = 总会活动，全站展示；选了某个分会则只在该分会详情页展示）",
        type: "select",
        optionsKey: "chapters",
      },
      {
        key: "committee_id",
        label: "所属委员会（留空 = 不归属具体委员会；选了则只在该委员会详情页展示）",
        type: "select",
        optionsKey: "committees",
      },
      { key: "title", label: "标题", type: "text", bilingual: true, required: true },
      { key: "slug", label: "URL Slug", type: "slug", required: true },
      { key: "summary", label: "简介", type: "textarea", bilingual: true },
      { key: "body", label: "正文", type: "richtext", bilingual: true, fullWidth: true },
      { key: "start_at", label: "开始时间", type: "datetime", required: true },
      { key: "end_at", label: "结束时间", type: "datetime" },
      { key: "timezone", label: "时区", type: "text", placeholder: "America/New_York" },
      { key: "location", label: "地点", type: "text", bilingual: true },
      { key: "host", label: "主办方", type: "text", bilingual: true },
      { key: "co_hosts", label: "协办方", type: "text", bilingual: true },
      { key: "cover_image", label: "封面图", type: "image" },
      { key: "gallery", label: "图集（每行一个链接）", type: "tags" },
      { key: "registration_deadline", label: "报名截止时间", type: "datetime" },
      { key: "capacity", label: "名额上限", type: "number" },
      {
        key: "event_status",
        label: "活动状态",
        type: "select",
        required: true,
        staticOptions: [
          { value: "upcoming", label: "即将举行" },
          { value: "ongoing", label: "进行中" },
          { value: "past", label: "已结束" },
          { value: "cancelled", label: "已取消" },
        ],
      },
      { key: "recap", label: "活动回顾", type: "richtext", bilingual: true, fullWidth: true },
      { key: "attachment_urls", label: "附件链接（每行一个）", type: "tags" },
      { key: "status", label: "发布状态", type: "select", staticOptions: CONTENT_STATUS_OPTIONS, required: true },
      { key: "published_at", label: "发布时间", type: "datetime" },
      { key: "sort_order", label: "排序权重", type: "number" },
      { key: "is_featured", label: "首页推荐", type: "checkbox" },
    ],
    listColumns: [
      { key: "title_zh", label: "标题" },
      { key: "category", label: "类别" },
      { key: "start_at", label: "开始时间" },
      { key: "event_status", label: "活动状态" },
      { key: "status", label: "发布状态" },
    ],
  },

  committees: {
    key: "committees",
    allowedRoles: ["super_admin", "content_admin"],
    table: "committees",
    labelZh: "委员会",
    labelEn: "Committees",
    hasStatus: true,
    hasSlug: true,
    hasSortOrder: true,
    defaultOrderBy: "sort_order",
    searchColumns: ["name_zh", "name_en", "slug"],
    selectQuery: "*, convener:leadership_people!committees_convener_person_id_fkey(name_zh,name_en)",
    relations: ["leadership_people"],
    titleField: "name",
    fields: [
      { key: "name", label: "委员会名称", type: "text", bilingual: true, required: true },
      { key: "slug", label: "URL Slug", type: "slug", required: true },
      { key: "intro", label: "简介", type: "richtext", bilingual: true, fullWidth: true },
      { key: "responsibilities", label: "职责", type: "richtext", bilingual: true, fullWidth: true },
      { key: "convener_person_id", label: "召集人", type: "select", optionsKey: "leadership_people" },
      { key: "annual_plan", label: "年度计划", type: "richtext", bilingual: true, fullWidth: true },
      { key: "cover_image", label: "封面图", type: "image" },
      { key: "sort_order", label: "排序权重", type: "number" },
      { key: "status", label: "状态", type: "select", staticOptions: CONTENT_STATUS_OPTIONS, required: true },
    ],
    listColumns: [
      { key: "name_zh", label: "名称" },
      { key: "convener", label: "召集人" },
      { key: "status", label: "状态" },
      { key: "sort_order", label: "排序" },
    ],
  },

  chapters: {
    key: "chapters",
    allowedRoles: ["super_admin", "content_admin", "chapter_admin"],
    table: "chapters",
    labelZh: "分会 / 全球网络",
    labelEn: "Chapters",
    hasStatus: true,
    hasSlug: true,
    hasSortOrder: true,
    defaultOrderBy: "sort_order",
    searchColumns: ["name_zh", "name_en", "slug"],
    selectQuery: "*, leader:leadership_people!chapters_leader_person_id_fkey(name_zh,name_en)",
    relations: ["leadership_people"],
    titleField: "name",
    chapterScopedColumn: "id",
    fields: [
      {
        key: "region_type",
        label: "区域类型",
        type: "select",
        required: true,
        staticOptions: [
          { value: "state", label: "州 State" },
          { value: "city", label: "城市 City" },
          { value: "overseas", label: "海外 Overseas" },
        ],
      },
      { key: "name", label: "分会名称", type: "text", bilingual: true, required: true },
      { key: "slug", label: "URL Slug", type: "slug", required: true },
      { key: "intro", label: "简介", type: "richtext", bilingual: true, fullWidth: true },
      { key: "leader_person_id", label: "负责人", type: "select", optionsKey: "leadership_people" },
      { key: "contact_email", label: "联系邮箱", type: "text" },
      { key: "contact_phone", label: "联系电话", type: "text" },
      { key: "address", label: "地址", type: "text", fullWidth: true },
      { key: "member_count_override", label: "会员数量（手动覆盖，留空则不展示）", type: "number" },
      { key: "cover_image", label: "封面图", type: "image" },
      { key: "map_lat", label: "纬度 Latitude", type: "number" },
      { key: "map_lng", label: "经度 Longitude", type: "number" },
      { key: "sort_order", label: "排序权重", type: "number" },
      { key: "status", label: "状态", type: "select", staticOptions: CONTENT_STATUS_OPTIONS, required: true },
    ],
    listColumns: [
      { key: "name_zh", label: "名称" },
      { key: "region_type", label: "类型" },
      { key: "leader", label: "负责人" },
      { key: "status", label: "状态" },
      { key: "sort_order", label: "排序" },
    ],
  },

  leadership: {
    key: "leadership",
    allowedRoles: ["super_admin", "content_admin"],
    table: "leadership_people",
    labelZh: "领导与人员",
    labelEn: "Leadership",
    hasStatus: false,
    hasSlug: false,
    hasSortOrder: true,
    defaultOrderBy: "sort_order",
    searchColumns: ["name_zh", "name_en", "title_zh", "title_en"],
    // committees / chapters 与 leadership_people 之间都存在两条外键关系（例如
    // leadership_people.committee_id -> committees.id，以及 committees.convener_person_id
    // -> leadership_people.id），PostgREST 无法自动判断要用哪一条做嵌套查询，
    // 必须显式指定外键约束名消歧，否则会报 "more than one relationship was found"
    // 导致整个查询失败、列表显示为空（departments 没有反向外键，不受影响，无需消歧）
    selectQuery:
      "*, departments(name_zh,name_en), committees!leadership_people_committee_id_fkey(name_zh,name_en), chapters!leadership_people_chapter_id_fkey(name_zh,name_en)",
    relations: ["departments", "committees", "chapters"],
    titleField: "name",
    fields: [
      { key: "name", label: "姓名", type: "text", bilingual: true, required: true },
      { key: "title", label: "职务", type: "text", bilingual: true, required: true },
      { key: "company", label: "公司/机构", type: "text", bilingual: true },
      {
        key: "governance_bodies",
        label: "治理机构（可多选——同一人身兼数职时，勾选全部机构即可，不用重复新建记录）",
        type: "multiselect",
        staticOptions: [
          { value: "general_assembly", label: "会员大会" },
          { value: "board_of_directors", label: "董事局" },
          { value: "executive_council", label: "执行理事会" },
          { value: "secretariat", label: "执行管理部门" },
          { value: "supervisory_board", label: "监事会" },
          { value: "advisory_committee", label: "顾问委员会" },
          { value: "honorary", label: "名誉职务" },
          { value: "leadership", label: "协会领导与核心成员（勾选后会出现在“协会领导与核心成员”页面）" },
        ],
      },
      {
        key: "department_ids",
        label: "所属部门（可多选——同一人同时负责多个部门时，勾选全部即可）",
        type: "multiselect",
        optionsKey: "departments",
      },
      { key: "committee_id", label: "所属委员会", type: "select", optionsKey: "committees" },
      { key: "chapter_id", label: "所属分会", type: "select", optionsKey: "chapters" },
      { key: "avatar_url", label: "头像", type: "image" },
      { key: "bio", label: "简介", type: "textarea", bilingual: true, fullWidth: true },
      { key: "sort_order", label: "排序权重", type: "number" },
      { key: "is_public", label: "对外公开展示", type: "checkbox" },
      { key: "show_contact", label: "公开联系方式", type: "checkbox" },
      { key: "contact_email", label: "联系邮箱", type: "text" },
      { key: "contact_phone", label: "联系电话", type: "text" },
      { key: "qr_code_url", label: "联系二维码（如微信名片码）", type: "image" },
      { key: "term_start", label: "任期开始", type: "date" },
      { key: "term_end", label: "任期结束", type: "date" },
      { key: "is_tba", label: "职位待定 (TBA)", type: "checkbox" },
    ],
    listColumns: [
      { key: "name_zh", label: "姓名" },
      { key: "title_zh", label: "职务" },
      { key: "governance_bodies", label: "治理机构" },
      { key: "is_public", label: "公开" },
      { key: "is_tba", label: "待定" },
      { key: "sort_order", label: "排序" },
    ],
  },

  partners: {
    key: "partners",
    allowedRoles: ["super_admin", "content_admin"],
    table: "partners",
    labelZh: "合作伙伴",
    labelEn: "Partners",
    hasPublishedAt: false,
    hasStatus: true,
    hasSlug: false,
    hasSortOrder: true,
    defaultOrderBy: "sort_order",
    searchColumns: ["name_zh", "name_en"],
    selectQuery: "*",
    relations: [],
    titleField: "name",
    fields: [
      {
        key: "category",
        label: "合作类别",
        type: "select",
        required: true,
        staticOptions: [
          { value: "strategic", label: "战略合作伙伴" },
          { value: "corporate", label: "企业合作伙伴" },
          { value: "media", label: "媒体合作伙伴" },
          { value: "educational", label: "教育合作伙伴" },
          { value: "government_community", label: "政府与社区伙伴" },
        ],
      },
      { key: "name", label: "名称", type: "text", bilingual: true, required: true },
      {
        key: "logo_url",
        label: "Logo",
        type: "image",
        accept: "image/png",
        acceptLabel: "仅支持 PNG 格式，建议使用透明背景、正方形或横向的图片",
      },
      { key: "website", label: "官网", type: "url" },
      { key: "description", label: "简介", type: "textarea", bilingual: true },
      { key: "sort_order", label: "排序权重", type: "number" },
      { key: "is_featured_home", label: "首页展示", type: "checkbox" },
      { key: "status", label: "状态", type: "select", staticOptions: CONTENT_STATUS_OPTIONS, required: true },
    ],
    listColumns: [
      { key: "name_zh", label: "名称" },
      { key: "category", label: "类别" },
      { key: "is_featured_home", label: "首页展示" },
      { key: "status", label: "状态" },
    ],
  },

  pages: {
    key: "pages",
    allowedRoles: ["super_admin", "content_admin"],
    table: "pages",
    labelZh: "页面管理",
    labelEn: "Pages",
    hasStatus: true,
    hasSlug: true,
    hasSortOrder: true,
    defaultOrderBy: "group",
    searchColumns: ["title_zh", "title_en", "slug"],
    selectQuery: "*",
    relations: [],
    titleField: "title",
    fields: [
      {
        key: "group",
        label: "分组",
        type: "select",
        required: true,
        staticOptions: [
          { value: "about", label: "关于我们" },
          { value: "legal", label: "法律页面" },
          { value: "services", label: "协会服务" },
          { value: "custom", label: "自定义页面" },
        ],
      },
      { key: "title", label: "标题", type: "text", bilingual: true, required: true },
      { key: "slug", label: "URL Slug", type: "slug", required: true },
      { key: "body", label: "正文", type: "richtext", bilingual: true, fullWidth: true },
      { key: "seo_title", label: "SEO 标题", type: "text", bilingual: true },
      { key: "seo_description", label: "SEO 描述", type: "textarea", bilingual: true },
      { key: "cover_image", label: "封面图", type: "image" },
      { key: "status", label: "状态", type: "select", staticOptions: CONTENT_STATUS_OPTIONS, required: true },
      { key: "published_at", label: "发布时间", type: "datetime" },
      { key: "sort_order", label: "排序权重", type: "number" },
    ],
    listColumns: [
      { key: "title_zh", label: "标题" },
      { key: "group", label: "分组" },
      { key: "slug", label: "Slug" },
      { key: "status", label: "状态" },
    ],
  },

  downloads: {
    key: "downloads",
    allowedRoles: ["super_admin", "content_admin"],
    table: "downloads",
    labelZh: "资料下载",
    labelEn: "Downloads",
    hasPublishedAt: false,
    hasStatus: true,
    hasSlug: false,
    hasSortOrder: true,
    defaultOrderBy: "sort_order",
    searchColumns: ["title_zh", "title_en"],
    selectQuery: "*",
    relations: [],
    titleField: "title",
    fields: [
      { key: "title", label: "标题", type: "text", bilingual: true, required: true },
      { key: "description", label: "说明", type: "textarea", bilingual: true },
      { key: "file_url", label: "文件链接", type: "file", required: true },
      { key: "file_type", label: "文件类型（如 PDF / XLSX）", type: "text" },
      { key: "file_size_bytes", label: "文件大小（字节）", type: "number" },
      {
        key: "category",
        label: "分类",
        type: "select",
        required: true,
        staticOptions: [
          { value: "industry_report", label: "行业报告" },
          { value: "policy_update", label: "政策速递" },
          { value: "restaurant_resource", label: "餐饮资源" },
          { value: "member_resource", label: "会员资料" },
          { value: "general", label: "综合" },
        ],
      },
      {
        key: "access_level",
        label: "访问权限",
        type: "select",
        required: true,
        staticOptions: [
          { value: "public", label: "公开" },
          { value: "member_only", label: "仅会员可见" },
        ],
      },
      { key: "status", label: "状态", type: "select", staticOptions: CONTENT_STATUS_OPTIONS, required: true },
      { key: "sort_order", label: "排序权重", type: "number" },
    ],
    listColumns: [
      { key: "title_zh", label: "标题" },
      { key: "category", label: "分类" },
      { key: "access_level", label: "权限" },
      { key: "status", label: "状态" },
    ],
  },

  video_categories: {
    key: "video_categories",
    allowedRoles: ["super_admin", "content_admin"],
    table: "video_categories",
    labelZh: "视频分类",
    labelEn: "Video Categories",
    hasStatus: false,
    hasSlug: true,
    hasSortOrder: true,
    defaultOrderBy: "sort_order",
    searchColumns: ["name_zh", "name_en", "slug"],
    selectQuery: "*",
    relations: [],
    titleField: "name",
    fields: [
      { key: "name", label: "分类名称", type: "text", bilingual: true, required: true },
      { key: "slug", label: "URL Slug（用于前台筛选链接，建议使用英文）", type: "slug", required: true },
      {
        key: "description",
        label: "说明（可选，仅后台可见，便于区分各分类用途）",
        type: "textarea",
        bilingual: true,
        fullWidth: true,
      },
      { key: "sort_order", label: "排序权重", type: "number" },
    ],
    listColumns: [
      { key: "name_zh", label: "名称" },
      { key: "slug", label: "Slug" },
      { key: "sort_order", label: "排序" },
    ],
  },

  videos: {
    key: "videos",
    allowedRoles: ["super_admin", "content_admin"],
    table: "videos",
    labelZh: "协会视频",
    labelEn: "Videos",
    hasStatus: true,
    hasSlug: true,
    hasSortOrder: true,
    defaultOrderBy: "sort_order",
    searchColumns: ["title_zh", "title_en", "person_name_zh", "person_name_en", "slug"],
    selectQuery: "*, category:video_categories(name_zh,name_en,slug)",
    relations: ["video_categories"],
    titleField: "title",
    fields: [
      { key: "title", label: "视频标题", type: "text", bilingual: true, required: true },
      { key: "category_id", label: "视频分类", type: "select", optionsKey: "video_categories", required: true },
      { key: "slug", label: "URL Slug（详情页永久链接）", type: "slug", required: true },
      { key: "intro", label: "视频简介（可选）", type: "textarea", bilingual: true, fullWidth: true },
      {
        key: "person_name",
        label: "人物姓名（可选——活动回顾、宣传片等没有单一人物的视频可留空）",
        type: "text",
        bilingual: true,
      },
      { key: "person_title", label: "人物身份或职务（可选）", type: "text", bilingual: true },
      {
        key: "video_path",
        label: "视频文件",
        type: "video",
        bucket: "videos",
        required: true,
        fullWidth: true,
        helpText: "支持 MP4 / MOV / WebM，最大 500MB；优先使用 MP4 以保证最佳兼容性，MOV 等格式请在上传前确认可正常播放",
      },
      {
        key: "cover_path",
        label: "自定义封面（可选）",
        type: "private_image",
        bucket: "videos",
        helpText: "留空则自动从视频首帧截取（会避开裁切人脸，必要时自动留白）",
      },
      // 以下均由 VideoUploadField / PrivateImageUploadField 通过 setMany() 自动写入，
      // 不在表单中单独展示输入框，仅登记以保证 initState / 保存时不丢失这些列。
      { key: "video_mime_type", label: "视频 MIME 类型", type: "hidden", valueKind: "text" },
      { key: "video_size_bytes", label: "视频文件大小（字节）", type: "hidden", valueKind: "number" },
      { key: "video_width", label: "视频宽度", type: "hidden", valueKind: "number" },
      { key: "video_height", label: "视频高度", type: "hidden", valueKind: "number" },
      { key: "video_duration_seconds", label: "视频时长（秒）", type: "hidden", valueKind: "number" },
      { key: "video_orientation", label: "视频方向", type: "hidden", valueKind: "text" },
      { key: "cover_is_auto", label: "封面是否自动生成", type: "hidden", valueKind: "boolean" },
      { key: "publish_date", label: "发布日期", type: "date" },
      {
        key: "is_featured_home",
        label: "首页推荐（最多 6 条，可来自不同分类，按排序权重取前 6）",
        type: "checkbox",
      },
      { key: "sort_order", label: "排序权重", type: "number" },
      { key: "status", label: "状态", type: "select", staticOptions: CONTENT_STATUS_OPTIONS, required: true },
    ],
    listColumns: [
      { key: "title_zh", label: "标题" },
      { key: "category", label: "分类" },
      { key: "person_name_zh", label: "人物" },
      { key: "status", label: "状态" },
      { key: "is_featured_home", label: "首页推荐" },
      { key: "sort_order", label: "排序" },
    ],
  },

  publications: {
    key: "publications",
    allowedRoles: ["super_admin", "content_admin"],
    table: "publications",
    labelZh: "协会刊物",
    labelEn: "Publications",
    hasStatus: true,
    hasSlug: true,
    hasSortOrder: true,
    defaultOrderBy: "sort_order",
    searchColumns: ["name_zh", "name_en", "slug"],
    selectQuery: "*",
    relations: [],
    titleField: "name",
    fields: [
      { key: "name", label: "刊物名称", type: "text", bilingual: true, required: true },
      { key: "slug", label: "URL Slug（阅读页永久链接，替换 PDF 后不变）", type: "slug", required: true },
      {
        key: "category",
        label: "分类",
        type: "select",
        required: true,
        staticOptions: [
          { value: "handbook", label: "协会手册" },
          { value: "journal", label: "会刊" },
          { value: "magazine", label: "杂志" },
          { value: "other", label: "其他资料" },
        ],
      },
      { key: "issue_label", label: "期号 / 年份（可选，如 2026年第3期）", type: "text", bilingual: true },
      { key: "intro", label: "简介（可选）", type: "textarea", bilingual: true, fullWidth: true },
      {
        key: "pdf_path",
        label: "PDF 文件",
        type: "pdf",
        bucket: "publications",
        required: true,
        fullWidth: true,
        helpText: "最大 200MB；替换文件会保留同一个阅读链接，原文件会在新文件上传成功后才被替换",
      },
      {
        key: "cover_path",
        label: "自定义封面（可选）",
        type: "private_image",
        bucket: "publications",
        helpText: "留空则自动使用 PDF 第一页渲染为封面",
      },
      // 由 PdfUploadField / PrivateImageUploadField 自动写入，不单独展示输入框。
      { key: "pdf_size_bytes", label: "PDF 文件大小（字节）", type: "hidden", valueKind: "number" },
      { key: "page_count", label: "总页数", type: "hidden", valueKind: "number" },
      { key: "cover_is_auto", label: "封面是否自动生成", type: "hidden", valueKind: "boolean" },
      { key: "publish_date", label: "发布日期", type: "date" },
      { key: "is_featured_home", label: "首页精选展示", type: "checkbox" },
      {
        key: "download_enabled",
        label: "前台显示下载按钮",
        type: "checkbox",
        helpText: "关闭仅隐藏前台下载入口，不能保证读者无法通过其他方式保存文件",
      },
      { key: "sort_order", label: "排序权重", type: "number" },
      { key: "status", label: "状态", type: "select", staticOptions: CONTENT_STATUS_OPTIONS, required: true },
    ],
    listColumns: [
      { key: "name_zh", label: "名称" },
      { key: "category", label: "分类" },
      { key: "status", label: "状态" },
      { key: "is_featured_home", label: "首页精选" },
      { key: "sort_order", label: "排序" },
    ],
  },

  navigation: {
    key: "navigation",
    allowedRoles: ["super_admin", "content_admin"],
    table: "navigation_items",
    labelZh: "导航菜单",
    labelEn: "Navigation",
    hasStatus: false,
    hasSlug: false,
    hasSortOrder: true,
    defaultOrderBy: "sort_order",
    searchColumns: ["label_zh", "label_en", "url"],
    // 不用 PostgREST 的 "!fkey" 关联语法嵌套查询"上级菜单"——这依赖数据库里
    // 确实存在 navigation_items_parent_id_fkey 这条外键约束、且 PostgREST 的
    // 接口缓存已经识别到它，任何一边没跟上都会导致整个列表查询报错、显示为空
    // （实际就踩到过这个问题）。改成列表页单独查一次纯 id/label_zh，在代码里
    // 拼出"上级菜单"这一列，不依赖数据库外键关系是否被接口层正确识别。
    selectQuery: "*",
    relations: ["navigation_items"],
    titleField: "label",
    fields: [
      {
        key: "menu",
        label: "菜单位置",
        type: "select",
        required: true,
        staticOptions: [
          { value: "header", label: "顶部导航 Header" },
          { value: "footer", label: "页脚导航 Footer" },
        ],
      },
      { key: "label", label: "菜单文字", type: "text", bilingual: true, required: true },
      { key: "url", label: "链接地址", type: "text", required: true, placeholder: "/zh/about 或 https://..." },
      { key: "parent_id", label: "上级菜单（留空为一级菜单）", type: "select", optionsKey: "navigation_items" },
      { key: "mega_menu_group", label: "大菜单分组标识（可选）", type: "text" },
      { key: "sort_order", label: "排序权重", type: "number" },
      { key: "is_active", label: "启用显示", type: "checkbox" },
      { key: "opens_new_tab", label: "新窗口打开", type: "checkbox" },
    ],
    listColumns: [
      { key: "label_zh", label: "菜单文字" },
      { key: "menu", label: "位置" },
      { key: "parent", label: "上级菜单" },
      { key: "url", label: "链接" },
      { key: "is_active", label: "启用" },
    ],
  },
};

export function getEntityConfig(key: string): EntityConfig | null {
  return entityRegistry[key] ?? null;
}

export function allEntityKeys(): string[] {
  return Object.keys(entityRegistry);
}

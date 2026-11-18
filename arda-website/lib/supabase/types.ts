// 数据库行类型定义（手写精简版；生产环境建议用 `supabase gen types typescript` 自动生成并替换本文件）

export type Locale = "zh" | "en";

export type ContentStatus = "draft" | "published" | "scheduled" | "unpublished";

export interface BilingualFields {
  title_zh?: string | null;
  title_en?: string | null;
}

export interface Role {
  id: string;
  key: "super_admin" | "content_admin" | "membership_admin" | "chapter_admin" | "viewer";
  name_zh: string;
  name_en: string;
  description: string | null;
}

export interface AdminUser {
  id: string;
  email: string;
  full_name: string | null;
  role_id: string;
  role?: Role;
  assigned_chapter_id: string | null;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
}

export interface MembershipType {
  id: string;
  key: string;
  name_zh: string;
  name_en: string;
  description_zh: string | null;
  description_en: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface Industry {
  id: string;
  key: string;
  name_zh: string;
  name_en: string;
  sort_order: number;
}

export type ApplicationStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "more_info_required"
  | "approved"
  | "rejected"
  | "archived";

export interface MemberApplication {
  id: string;
  application_no: string;
  status: ApplicationStatus;
  real_name: string;
  english_name: string | null;
  phone: string;
  email: string;
  company_name_zh: string | null;
  company_name_en: string | null;
  title: string | null;
  membership_type_id: string | null;
  state: string;
  city: string;
  company_address: string | null;
  company_website: string | null;
  social_media: string | null;
  industry_id: string | null;
  business_type: string | null;
  company_size: string | null;
  store_count: number | null;
  employee_count: number | null;
  founded_year: number | null;
  service_area: string | null;
  bio: string | null;
  desired_services: string[] | null;
  desired_committee_ids: string[] | null;
  desired_chapter_id: string | null;
  referrer: string | null;
  remarks: string | null;
  logo_url: string | null;
  avatar_url: string | null;
  document_urls: string[] | null;
  agree_privacy: boolean;
  agree_contact: boolean;
  confirm_accuracy: boolean;
  e_signature: string | null;
  submitted_at: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  internal_notes: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: string;
  slug: string;
  name_zh: string;
  name_en: string;
  parent_department_id: string | null;
  sort_order: number;
}

export interface Committee {
  id: string;
  slug: string;
  name_zh: string;
  name_en: string;
  intro_zh: string | null;
  intro_en: string | null;
  responsibilities_zh: string | null;
  responsibilities_en: string | null;
  convener_person_id: string | null;
  annual_plan_zh: string | null;
  annual_plan_en: string | null;
  cover_image: string | null;
  sort_order: number;
  status: ContentStatus;
}

export interface Chapter {
  id: string;
  slug: string;
  region_type: "state" | "city" | "overseas";
  name_zh: string;
  name_en: string;
  intro_zh: string | null;
  intro_en: string | null;
  leader_person_id: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
  member_count_override: number | null;
  cover_image: string | null;
  map_lat: number | null;
  map_lng: number | null;
  sort_order: number;
  status: ContentStatus;
}

export type GovernanceBody =
  | "general_assembly"
  | "board_of_directors"
  | "executive_council"
  | "secretariat"
  | "supervisory_board"
  | "advisory_committee"
  | "honorary"
  // “协会领导与核心成员”页面专用的勾选项：跟其他治理机构是同一套
  // governance_bodies 多选字段，只是这里不代表某个具体的治理机构，而是
  // 后台人工挑选“要在这个页面展示的人”，可以跟其他机构勾选并存
  | "leadership";

export interface LeadershipPerson {
  id: string;
  name_zh: string;
  name_en: string;
  title_zh: string;
  title_en: string;
  company_zh: string | null;
  company_en: string | null;
  governance_body: GovernanceBody | null;
  /** 一人可同时身兼多个治理机构职务（如同时是董事局与执行理事会成员），
   * 用这个数组字段表示，避免同一人需要重复建档；旧的单值 governance_body
   * 字段继续保留，仅作历史兼容，前台/后台查询一律改用这个数组字段 */
  governance_bodies: GovernanceBody[];
  department_id: string | null;
  /** 一人可同时负责多个秘书处下属部门（如 Henry He 同时是办公室主任和
   * 财务与基金部负责人），用这个数组字段表示；旧的单值 department_id
   * 字段继续保留，仅作历史兼容，前台分组显示一律改用这个数组字段 */
  department_ids: string[];
  committee_id: string | null;
  chapter_id: string | null;
  avatar_url: string | null;
  bio_zh: string | null;
  bio_en: string | null;
  sort_order: number;
  is_public: boolean;
  show_contact: boolean;
  contact_email: string | null;
  contact_phone: string | null;
  qr_code_url: string | null;
  term_start: string | null;
  term_end: string | null;
  is_tba: boolean;
}

export interface NewsPost {
  id: string;
  slug: string;
  category_id: string | null;
  /** 留空 = 总会/全站新闻；指定某个分会时，这条新闻只在该分会详情页展示 */
  chapter_id: string | null;
  title_zh: string;
  title_en: string;
  excerpt_zh: string | null;
  excerpt_en: string | null;
  body_zh: string | null;
  body_en: string | null;
  cover_image: string | null;
  /** 文章顶部视频（可选）：填了就在文章详情页正文最上面（原来放封面图的位置）
   * 显示视频播放器，取代封面图；留空则跟以前一样只显示封面图 */
  video_url: string | null;
  gallery: string[] | null;
  tags: string[] | null;
  author: string | null;
  source_zh: string | null;
  source_en: string | null;
  is_pinned: boolean;
  view_count: number;
  seo_title_zh: string | null;
  seo_title_en: string | null;
  seo_description_zh: string | null;
  seo_description_en: string | null;
  status: ContentStatus;
  published_at: string | null;
  sort_order: number;
}

export interface EventItem {
  id: string;
  slug: string;
  category: "forum" | "training" | "delegation" | "exchange" | "general";
  /** 留空 = 总会/全站活动；指定后这场活动只在对应分会/委员会详情页展示 */
  chapter_id: string | null;
  committee_id: string | null;
  title_zh: string;
  title_en: string;
  summary_zh: string | null;
  summary_en: string | null;
  body_zh: string | null;
  body_en: string | null;
  start_at: string;
  end_at: string | null;
  timezone: string;
  location_zh: string | null;
  location_en: string | null;
  map_lat: number | null;
  map_lng: number | null;
  host_zh: string | null;
  host_en: string | null;
  co_hosts_zh: string | null;
  co_hosts_en: string | null;
  cover_image: string | null;
  gallery: string[] | null;
  registration_deadline: string | null;
  capacity: number | null;
  event_status: "upcoming" | "ongoing" | "past" | "cancelled";
  recap_zh: string | null;
  recap_en: string | null;
  attachment_urls: string[] | null;
  status: ContentStatus;
  published_at: string | null;
  sort_order: number;
  is_featured: boolean;
}

export interface Partner {
  id: string;
  category: "strategic" | "corporate" | "media" | "educational" | "government_community";
  name_zh: string;
  name_en: string;
  logo_url: string | null;
  website: string | null;
  description_zh: string | null;
  description_en: string | null;
  sort_order: number;
  is_featured_home: boolean;
  status: ContentStatus;
}

export interface Page {
  id: string;
  slug: string;
  group: "about" | "legal" | "services" | "custom";
  title_zh: string;
  title_en: string;
  body_zh: string | null;
  body_en: string | null;
  seo_title_zh: string | null;
  seo_title_en: string | null;
  seo_description_zh: string | null;
  seo_description_en: string | null;
  cover_image: string | null;
  status: ContentStatus;
  published_at: string | null;
  sort_order: number;
}

export interface Download {
  id: string;
  title_zh: string;
  title_en: string;
  description_zh: string | null;
  description_en: string | null;
  file_url: string;
  file_type: string | null;
  file_size_bytes: number | null;
  category: "industry_report" | "policy_update" | "restaurant_resource" | "member_resource" | "general";
  access_level: "public" | "member_only";
  download_count: number;
  status: ContentStatus;
  sort_order: number;
}

export interface SiteSetting {
  id: string;
  key: string;
  value_json: unknown;
  description: string | null;
}

export type VideoOrientation = "landscape" | "portrait" | "square";

export interface VideoCategory {
  id: string;
  slug: string;
  name_zh: string;
  name_en: string;
  description_zh: string | null;
  description_en: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Video {
  id: string;
  slug: string;
  category_id: string;
  title_zh: string;
  title_en: string;
  intro_zh: string | null;
  intro_en: string | null;
  person_name_zh: string | null;
  person_name_en: string | null;
  person_title_zh: string | null;
  person_title_en: string | null;
  video_path: string;
  video_mime_type: string | null;
  video_size_bytes: number | null;
  video_width: number | null;
  video_height: number | null;
  video_duration_seconds: number | null;
  video_orientation: VideoOrientation | null;
  cover_path: string | null;
  cover_is_auto: boolean;
  publish_date: string | null;
  is_featured_home: boolean;
  sort_order: number;
  status: ContentStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export type PublicationCategory = "handbook" | "journal" | "magazine" | "other";

export interface Publication {
  id: string;
  slug: string;
  name_zh: string;
  name_en: string;
  category: PublicationCategory;
  issue_label_zh: string | null;
  issue_label_en: string | null;
  intro_zh: string | null;
  intro_en: string | null;
  pdf_path: string;
  pdf_size_bytes: number | null;
  page_count: number | null;
  cover_path: string | null;
  cover_is_auto: boolean;
  publish_date: string | null;
  is_featured_home: boolean;
  download_enabled: boolean;
  sort_order: number;
  status: ContentStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface NavigationItem {
  id: string;
  menu: "header" | "footer";
  parent_id: string | null;
  label_zh: string;
  label_en: string;
  url: string;
  mega_menu_group: string | null;
  sort_order: number;
  is_active: boolean;
  opens_new_tab: boolean;
}

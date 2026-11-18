-- ============================================================
-- ARDA 种子数据 / Seed Data
-- 执行方式见 README「数据库设置」章节。
-- 所有数字类占位数据（会员数、分会人数等）均为 0 或行业通用样例，
-- 后台可随时修改；不包含任何虚构的协会历史成就或认证。
-- ============================================================

-- ---------- 1. 角色与权限 ----------
insert into public.roles (key, name_zh, name_en, description) values
  ('super_admin', '超级管理员', 'Super Admin', '全部权限'),
  ('content_admin', '内容管理员', 'Content Admin', '新闻/活动/委员会/分会/领导/合作伙伴/页面/媒体'),
  ('membership_admin', '会员管理员', 'Membership Admin', '会员申请审核与导出、会员名录管理'),
  ('chapter_admin', '分会管理员', 'Chapter Admin', '仅管理所指派分会的内容与申请'),
  ('viewer', '只读查看', 'Viewer', '仅查看统计数据');

insert into public.permissions (key, description) values
  ('content.publish', '新增/编辑/发布内容'),
  ('content.delete', '删除内容'),
  ('applications.review', '查看与审核会员申请'),
  ('applications.export', '导出会员申请数据'),
  ('applications.delete', '删除会员申请'),
  ('users.manage', '管理后台账号与角色'),
  ('settings.manage', '管理站点设置/导航/SEO'),
  ('audit.read', '查看操作日志');

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id from public.roles r, public.permissions p
where r.key = 'super_admin';

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id from public.roles r, public.permissions p
where r.key = 'content_admin' and p.key in ('content.publish','content.delete');

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id from public.roles r, public.permissions p
where r.key = 'membership_admin' and p.key in ('applications.review','applications.export','applications.delete');

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id from public.roles r, public.permissions p
where r.key = 'chapter_admin' and p.key in ('content.publish','applications.review');

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id from public.roles r, public.permissions p
where r.key = 'viewer' and p.key in ('audit.read');

-- ---------- 2. 会员类别 ----------
insert into public.membership_types (key, name_zh, name_en, description_zh, description_en, sort_order) values
  ('founding', '创会会员', 'Founding Member', '协会创立阶段的核心支持者', 'Core supporters who join during the founding phase of the Association', 1),
  ('corporate', '企业会员', 'Corporate Member', '面向餐饮企业、供应链及相关服务机构', 'For restaurant companies, supply chain and related service providers', 2),
  ('individual', '个人会员', 'Individual Member', '面向行业从业人员及创业者', 'For industry professionals and entrepreneurs', 3),
  ('professional', '专业会员', 'Professional Member', '面向法律、会计、地产、保险等专业服务人士', 'For legal, accounting, real estate, insurance and other professionals', 4),
  ('partner', '合作会员', 'Partner Member', '面向长期合作机构', 'For long-term partner organizations', 5),
  ('honorary', '荣誉会员', 'Honorary Member', '由协会理事会授予', 'Conferred by the ARDA Board of Directors', 6);

-- ---------- 3. 行业分类 ----------
insert into public.industries (key, name_zh, name_en, sort_order) values
  ('restaurant_operator', '餐厅经营者/餐饮集团', 'Restaurant Operators & Groups', 1),
  ('food_supplier', '食材供应商', 'Food Suppliers', 2),
  ('equipment_supplier', '餐饮设备供应商', 'Restaurant Equipment Suppliers', 3),
  ('cold_chain_logistics', '冷链及物流企业', 'Cold Chain & Logistics', 4),
  ('foodtech_ai', '餐饮科技与人工智能企业', 'Restaurant Tech & AI', 5),
  ('pos_payment', 'POS及支付服务商', 'POS & Payment Providers', 6),
  ('investment', '餐饮投资机构', 'Restaurant Investment Firms', 7),
  ('professional_services', '法律/会计/地产/保险等专业机构', 'Legal, Accounting, Real Estate & Insurance Services', 8),
  ('education_training', '教育培训机构', 'Education & Training Institutions', 9),
  ('entrepreneur', '餐饮创业者及从业人员', 'Entrepreneurs & Industry Professionals', 10);

-- ---------- 4. 新闻分类 ----------
insert into public.news_categories (slug, name_zh, name_en, sort_order) values
  ('association-news', '协会新闻', 'Association News', 1),
  ('industry-news', '行业资讯', 'Industry News', 2),
  ('press-release', '新闻稿', 'Press Releases', 3),
  ('media-coverage', '媒体报道', 'Media Coverage', 4);

-- ---------- 5. 部门 ----------
insert into public.departments (slug, name_zh, name_en, sort_order) values
  ('secretariat', '秘书处', 'Secretariat', 1),
  ('office', '办公室', 'Office', 2),
  ('finance-fund', '财务与基金部', 'Finance & Fund Department', 3),
  ('brand-pr', '品牌宣传公关部', 'Brand & Public Relations Department', 4);

-- ---------- 6. FAQ ----------
insert into public.faq_items ("group", question_zh, question_en, answer_zh, answer_en, sort_order) values
  ('membership', '现阶段加入协会需要缴纳会费吗？', 'Is there a membership fee at this stage?',
   '现阶段会员费政策以协会正式公告为准。请提交申请，协会秘书处会与您联系说明当前阶段的具体安排。',
   'Current membership fee policy will be announced officially by the Association. Please submit an application and our Secretariat will contact you with details for the current phase.', 1),
  ('membership', '申请提交后多久能收到审核结果？', 'How long does the review take after I submit my application?',
   '协会秘书处会尽快处理您的申请，审核过程中如需补充材料会通过邮件与您联系。您可以随时使用申请编号与邮箱查询进度。',
   'Our Secretariat will process your application as promptly as possible. If additional materials are needed, we will contact you by email. You can check your status anytime using your application number and email.', 2),
  ('membership', '不同会员类别有什么区别？', 'What is the difference between membership types?',
   '请参阅"会员类别"页面了解创会会员、企业会员、个人会员、专业会员、合作会员与荣誉会员的定位说明。',
   'Please see the "Membership Types" page for details on Founding, Corporate, Individual, Professional, Partner and Honorary Membership.', 3),
  ('donation', '捐赠是否可以获得税务抵扣？', 'Is my donation tax-deductible?',
   '有关捐赠及税务事项，请联系协会确认。协会将在具备相关合法证明后于本页更新说明。',
   'For questions about donations and tax matters, please contact the Association to confirm. This page will be updated once relevant documentation is available.', 1),
  ('donation', '企业可以赞助协会活动吗？', 'Can a company sponsor an ARDA event?',
   '欢迎企业赞助协会举办的论坛、峰会及培训活动，请通过本页联系表单与协会取得联系。',
   'Companies are welcome to sponsor ARDA forums, summits and training programs. Please reach out via the contact form on this page.', 2);

-- ---------- 7. 委员会 ----------
insert into public.committees (slug, name_zh, name_en, intro_zh, intro_en, responsibilities_zh, responsibilities_en, annual_plan_zh, annual_plan_en, sort_order, status, published_at) values
  ('branding-franchise', '品牌连锁委员会', 'Branding & Franchise Committee',
   '聚焦餐饮品牌建设与连锁化发展，协助会员企业提升品牌价值、拓展全美及国际市场。',
   'Focused on brand building and franchise growth, helping member companies strengthen brand value and expand across the U.S. and internationally.',
   '制定品牌推广策略建议、组织连锁经营经验交流、对接特许加盟资源、推动优质品牌案例分享。',
   'Advising on brand strategy, organizing franchise operations exchanges, connecting franchising resources, and sharing best-practice brand case studies.',
   '年度计划将由委员会召集人牵头制定并在此页面更新。', 'The annual plan will be led by the committee convener and updated here.', 1, 'published', now()),
  ('supply-chain', '供应链委员会', 'Supply Chain Committee',
   '连接食材供应、餐饮设备与冷链物流资源，帮助会员企业优化采购与配送效率。',
   'Connecting food supply, restaurant equipment and cold chain logistics resources to help member companies optimize procurement and distribution.',
   '搭建供应链资源对接平台、推动集采合作、组织供应商评估交流、跟踪冷链物流政策动态。',
   'Building a supply chain resource-matching platform, promoting group purchasing collaboration, organizing supplier evaluation exchanges, and tracking cold-chain logistics policy updates.',
   '年度计划将由委员会召集人牵头制定并在此页面更新。', 'The annual plan will be led by the committee convener and updated here.', 2, 'published', now()),
  ('technology-ai', '科技与AI委员会', 'Technology & AI Committee',
   '推动人工智能在点餐、厨房管理、营销与数据分析等场景的应用，助力会员企业数字化转型。',
   'Advancing the application of AI in ordering, kitchen management, marketing and data analytics to support member companies'' digital transformation.',
   '评估餐饮科技解决方案、组织技术交流与演示、推动会员企业数字化试点、跟踪行业技术趋势。',
   'Evaluating restaurant technology solutions, organizing tech exchanges and demos, supporting digital-transformation pilots, and tracking industry technology trends.',
   '年度计划将由委员会召集人牵头制定并在此页面更新。', 'The annual plan will be led by the committee convener and updated here.', 3, 'published', now()),
  ('capital-investment', '资本投资委员会', 'Capital & Investment Committee',
   '连接优质餐饮企业与投资、融资和资本市场资源，助力企业稳健成长。',
   'Connecting quality restaurant companies with investment, financing and capital market resources to support sustainable growth.',
   '组织投融资对接活动、提供资本市场基础知识分享、协助企业完善财务规范、跟踪行业投资动态。',
   'Organizing investment-matching events, sharing capital markets fundamentals, helping companies strengthen financial governance, and tracking industry investment trends.',
   '年度计划将由委员会召集人牵头制定并在此页面更新。', 'The annual plan will be led by the committee convener and updated here.', 4, 'published', now()),
  ('legal-policy', '法律政策委员会', 'Legal & Policy Committee',
   '关注影响餐饮行业的法律法规与政策动态，为会员提供合规参考与政策倡导支持。',
   'Monitoring laws, regulations and policy developments affecting the restaurant industry, and providing compliance references and policy advocacy support for members.',
   '跟踪劳工、税务、食品安全等相关政策、组织合规讲座、协助会员反馈行业诉求。',
   'Tracking labor, tax, food safety and related policy developments, organizing compliance briefings, and helping members voice industry concerns.',
   '年度计划将由委员会召集人牵头制定并在此页面更新。', 'The annual plan will be led by the committee convener and updated here.', 5, 'published', now()),
  ('next-gen-entrepreneurship', '新生代餐饮创业委员会', 'Next-Generation Restaurateurs & Entrepreneurship Committee',
   '面向新生代餐饮创业者，提供创业指导、人才培养与跨代际交流平台。',
   'Serving next-generation restaurant entrepreneurs with mentorship, talent development and cross-generational exchange.',
   '组织创业分享会、对接导师资源、协助青年创业者拓展行业人脉、推动创新项目孵化。',
   'Organizing entrepreneurship sharing sessions, connecting mentorship resources, helping young entrepreneurs build industry networks, and supporting innovative project incubation.',
   '年度计划将由委员会召集人牵头制定并在此页面更新。', 'The annual plan will be led by the committee convener and updated here.', 6, 'published', now());

-- ---------- 8. 地方分会 ----------
insert into public.chapters (slug, region_type, name_zh, name_en, intro_zh, intro_en, sort_order, status, published_at) values
  ('new-york', 'state', '纽约分会', 'New York Chapter', '协会总部所在地分会，服务纽约地区餐饮从业者。', 'Home chapter of the Association, serving restaurant professionals in the New York area.', 1, 'published', now()),
  ('california', 'state', '加州分会', 'California Chapter', '服务加州地区会员企业与从业者。', 'Serving member companies and professionals across California.', 2, 'published', now()),
  ('texas', 'state', '德州分会', 'Texas Chapter', '服务德州地区会员企业与从业者。', 'Serving member companies and professionals across Texas.', 3, 'published', now()),
  ('florida', 'state', '佛州分会', 'Florida Chapter', '服务佛罗里达州会员企业与从业者。', 'Serving member companies and professionals across Florida.', 4, 'published', now()),
  ('new-jersey', 'state', '新泽西分会', 'New Jersey Chapter', '服务新泽西州会员企业与从业者。', 'Serving member companies and professionals across New Jersey.', 5, 'published', now()),
  ('illinois', 'state', '伊利诺伊分会', 'Illinois Chapter', '服务伊利诺伊州会员企业与从业者。', 'Serving member companies and professionals across Illinois.', 6, 'published', now()),
  ('washington', 'state', '华盛顿州分会', 'Washington Chapter', '服务华盛顿州会员企业与从业者。', 'Serving member companies and professionals across Washington State.', 7, 'published', now()),
  ('boston', 'city', '波士顿分会', 'Boston Chapter', '服务大波士顿地区会员企业与从业者。', 'Serving member companies and professionals across Greater Boston.', 8, 'published', now()),
  ('las-vegas', 'city', '拉斯维加斯分会', 'Las Vegas Chapter', '服务拉斯维加斯地区会员企业与从业者。', 'Serving member companies and professionals across Las Vegas.', 9, 'published', now()),
  ('hawaii', 'state', '夏威夷分会', 'Hawaii Chapter', '服务夏威夷州会员企业与从业者。', 'Serving member companies and professionals across Hawaii.', 10, 'published', now()),
  ('overseas-partners', 'overseas', '海外合作机构', 'Overseas Partners', '与海外餐饮行业机构建立合作关系，推动国际交流。', 'Building relationships with overseas restaurant industry organizations to advance international exchange.', 11, 'published', now());

-- ---------- 9. 领导团队（依据用户提供初始名单；未定职位统一标注待定） ----------
insert into public.leadership_people (name_zh, name_en, title_zh, title_en, governance_body, sort_order, is_public, is_tba) values
  ('杨辉', 'Yang Hui', '主席', 'President', 'board_of_directors', 1, true, false),
  ('杨英勤', 'Yang Yingqin', '共同主席', 'Co-Chair', 'board_of_directors', 2, true, false),
  ('陈世品', 'Chen Shipin', '共同主席', 'Co-Chair', 'board_of_directors', 3, true, false),
  ('郑旭', 'Zheng Xu', '共同主席', 'Co-Chair', 'board_of_directors', 4, true, false),
  ('Eddie Zheng', 'Eddie Zheng', '共同主席', 'Co-Chair', 'board_of_directors', 5, true, false),
  ('朱春雷', 'Zhu Chunlei', '共同主席', 'Co-Chair', 'board_of_directors', 6, true, false),
  ('陈克柱', 'Chen Kezhu', '共同主席', 'Co-Chair', 'board_of_directors', 7, true, false),
  ('Jay Li', 'Jay Li', '执行主席', 'Executive Vice President', 'executive_council', 8, true, false),
  ('待定', 'To Be Announced', '副主席（各州拟定中）', 'Vice President (State appointments pending)', 'executive_council', 9, true, true),
  ('待定', 'To Be Announced', '监事长', 'Chair of Supervisory Board', 'supervisory_board', 10, true, true),
  ('林建中', 'Lin Jianzhong', '荣誉主席', 'Honorary President', 'honorary', 11, true, false),
  ('王贵阳', 'Wang Guiyang', '总顾问', 'Chief Advisor', 'advisory_committee', 12, true, false),
  ('陈善莊', 'Chen Shanzhuang', '荣誉顾问', 'Honorary Advisor', 'advisory_committee', 13, true, false),
  ('David Lin', 'David Lin', '荣誉顾问', 'Honorary Advisor', 'advisory_committee', 14, true, false),
  ('陈鸿滨', 'Chen Hongbin', '荣誉顾问', 'Honorary Advisor', 'advisory_committee', 15, true, false),
  ('朱立业', 'Zhu Liye', '秘书长', 'Secretary General', 'secretariat', 16, true, false),
  ('Fay Lin', 'Fay Lin', '副秘书长', 'Deputy Secretary General', 'secretariat', 17, true, false),
  ('Ricky Fang', 'Ricky Fang', '主席助理', 'Assistant to the President', 'secretariat', 18, true, false),
  ('王平', 'Wang Ping', '国际合作发展事务官', 'Partnership Development Officer', 'secretariat', 19, true, false),
  ('Henry He', 'Henry He', '办公室主任', 'Office Director', 'secretariat', 20, true, false),
  ('Jessica Xiao', 'Jessica Xiao', '财务与基金部', 'Finance & Fund Department', 'secretariat', 22, true, false),
  ('Peter Ou', 'Peter Ou', '财务与基金部', 'Finance & Fund Department', 'secretariat', 23, true, false),
  ('高娓娓', 'Gao Weiwei', '品牌宣传公关部', 'Brand & Public Relations Department', 'secretariat', 24, true, false),
  ('江建圣', 'Jiang Jiansheng', '品牌宣传公关部', 'Brand & Public Relations Department', 'secretariat', 25, true, false);

-- Henry He 同时属于办公室主任与财务与基金部（重复记录，分别体现两项职责）
insert into public.leadership_people (name_zh, name_en, title_zh, title_en, governance_body, sort_order, is_public, is_tba) values
  ('Henry He', 'Henry He', '财务与基金部', 'Finance & Fund Department', 'secretariat', 21, true, false);

-- 部门归属（按名称匹配，简化脚本；生产环境建议后台手动指派）
update public.leadership_people set department_id = (select id from public.departments where slug = 'secretariat')
  where title_zh in ('秘书长','副秘书长','主席助理','国际合作发展事务官');
update public.leadership_people set department_id = (select id from public.departments where slug = 'office')
  where title_zh = '办公室主任';
update public.leadership_people set department_id = (select id from public.departments where slug = 'finance-fund')
  where title_zh = '财务与基金部';
update public.leadership_people set department_id = (select id from public.departments where slug = 'brand-pr')
  where title_zh = '品牌宣传公关部';

-- 委员会召集人待后台指派：先关联委员会占位，委员名单初始为空，后台可随时新增
update public.committees set convener_person_id = null;

-- ---------- 10. 站点设置 ----------
insert into public.site_settings (key, value_json, description) values
  ('site_logo', '""'::jsonb, '站点 Logo 图片链接（字符串，留空 "" 则前台显示默认的 "ARDA" 文字徽标）。在后台「站点设置」中打开本项，把内容替换为图片链接并保留引号，例如 "https://.../logo.png"；图片可先在任意一个内容管理页面（如「合作伙伴」编辑页）的图片字段用「上传」按钮传上去，把生成的链接复制过来即可'),
  ('home_stats', '[
     {"key":"members","label_zh":"会员企业与个人","label_en":"Members","value":"0","suffix":"+"},
     {"key":"chapters","label_zh":"地方分会","label_en":"Chapters","value":"11"},
     {"key":"committees","label_zh":"专业委员会","label_en":"Committees","value":"7"},
     {"key":"events","label_zh":"年度活动","label_en":"Annual Events","value":"0","suffix":"+"}
   ]'::jsonb, '首页统计数字，占位数字，后台可修改'),
  ('home_hero', '[
     {"kicker_zh":"美国餐饮业发展协会","kicker_en":"American Restaurant Development Association",
      "title_zh":"凝心聚力，链通全美餐饮产业","title_en":"Uniting and Empowering the U.S. Restaurant Industry",
      "subtitle_zh":"整合品牌、供应链、科技、资本、媒体与社区资源，服务全美餐饮从业者。\nAI时代，做最贴近华人圈子和中餐的餐饮协会。\n愿景是助力华餐发展成为主流。",
      "subtitle_en":"Connecting brands, supply chains, technology, capital, media and community resources for restaurant professionals nationwide.\nIn the AI era, the restaurant association closest to the Chinese community and Chinese cuisine.\nOur vision is to help Chinese cuisine become mainstream.",
      "image":""}
   ]'::jsonb, '首页 Hero 轮播内容'),
  ('contact_info', '{
     "address_zh":"美国纽约州法拉盛缅街（Main St）36-26 号 2X 室，邮编 11354","address_en":"36-26 Main St, Suite 2X, Flushing, NY 11354",
     "phone":"+1 (000) 000-0000","email":"info@ardaus.org",
     "office_hours_zh":"周一至周五 9:00–18:00（美东时间）","office_hours_en":"Mon–Fri, 9:00 AM–6:00 PM (Eastern Time)",
     "media_email":"info@ardaus.org","membership_email":"info@ardaus.org","business_email":"info@ardaus.org",
     "map_lat":40.762413,"map_lng":-73.831913,"social":[]
   }'::jsonb, '联系方式与社交链接'),
  ('home_mission', '[
     {"title_zh":"凝心聚力","title_en":"Unity","desc_zh":"团结全美餐饮从业者，建立跨区域、跨族裔的行业共同体","desc_en":"Uniting restaurant professionals nationwide into a cross-regional, cross-ethnic community"},
     {"title_zh":"服务企业","title_en":"Business Support","desc_zh":"帮助会员提升经营能力、开拓市场并增强抗风险能力","desc_en":"Helping members strengthen operations, open markets and build resilience"},
     {"title_zh":"链通产业","title_en":"Industry Connection","desc_zh":"连接食材、设备、冷链物流及相关配套服务","desc_en":"Linking food supply, equipment and cold chain logistics resources"},
     {"title_zh":"智创未来","title_en":"Innovation","desc_zh":"推动 AI 在点餐、厨房、营销、管理和数据分析中的应用","desc_en":"Advancing AI in ordering, kitchen, marketing and analytics"},
     {"title_zh":"育才储能","title_en":"Talent Development","desc_zh":"培养餐饮管理人才、创新人才和新生代创业者","desc_en":"Cultivating management talent and next-generation entrepreneurs"},
     {"title_zh":"资本赋能","title_en":"Capital Access","desc_zh":"连接优质餐饮企业与投资、融资和资本市场资源","desc_en":"Connecting companies with investment and capital market resources"},
     {"title_zh":"品牌推广","title_en":"Brand Promotion","desc_zh":"帮助优质品牌从本地走向全美及国际市场","desc_en":"Helping strong brands grow to national and international markets"},
     {"title_zh":"文化传播","title_en":"Cultural Exchange","desc_zh":"通过餐饮促进亚洲饮食文化和跨族裔交流","desc_en":"Promoting Asian culinary culture and cross-ethnic exchange"}
   ]'::jsonb, '首页使命板块条目'),
  ('home_membership_value', '[
     {"title_zh":"行业人脉网络","title_en":"Industry Network","desc_zh":"接入全美跨区域、跨族裔的餐饮从业者网络","desc_en":"Access a nationwide, cross-ethnic network of restaurant professionals"},
     {"title_zh":"资源对接","title_en":"Resource Matching","desc_zh":"优先获得供应链、科技、资本等产业资源对接机会","desc_en":"Priority access to supply chain, technology and capital resources"},
     {"title_zh":"专业培训","title_en":"Professional Training", "desc_zh":"参与协会组织的管理培训与创业指导项目","desc_en":"Participate in management training and entrepreneurship guidance"},
     {"title_zh":"品牌曝光","title_en":"Brand Visibility","desc_zh":"通过协会媒体与活动渠道提升品牌影响力","desc_en":"Increase brand visibility through ARDA media and events"}
   ]'::jsonb, '首页会员价值板块条目'),
  ('seo_defaults', '{
     "site_name_zh":"美国餐饮业发展协会","site_name_en":"American Restaurant Development Association",
     "default_description_zh":"美国餐饮业发展协会（ARDA）致力于成为全美最具影响力的亚裔餐饮行业组织。",
     "default_description_en":"The American Restaurant Development Association (ARDA) is building the most influential Asian-American restaurant industry organization in the U.S."
   }'::jsonb, 'SEO 默认标题与描述');

-- ---------- 11. 导航菜单 ----------
-- 顶部主导航精简为 7 大类（依用户提供的导航结构图），关于我们／协会动态 下设下拉子菜单；
-- 专业委员会／分会与全球网络／项目与活动／合作伙伴／资源中心 等页面继续存在，
-- 分别可经由「协会动态」下拉中的"会员活动"、页脚导航及首页各版块入口访问，不会成为孤页。
insert into public.navigation_items (menu, label_zh, label_en, url, sort_order) values
  ('header', '首页', 'Homepage', '/', 1),
  ('header', '关于我们', 'About Us', '/about', 2),
  ('header', '协会动态', 'Association News', '/news', 3),
  ('header', '协会服务', 'Association Services', '/services', 4),
  ('header', '捐款', 'Donation', '/donate', 5),
  ('header', '加入协会', 'Join Association', '/membership', 6),
  ('header', '联系我们', 'Contact Us', '/contact', 7),
  ('footer', '关于协会', 'About', '/about', 1),
  ('footer', '协会动态', 'Association News', '/news', 2),
  ('footer', '项目与活动', 'Programs & Events', '/events', 3),
  ('footer', '专业委员会', 'Committees', '/committees', 4),
  ('footer', '分会与全球网络', 'Chapters & Global Network', '/chapters', 5),
  ('footer', '合作伙伴', 'Partners', '/partners', 6),
  ('footer', '会员中心', 'Membership', '/membership', 7),
  ('footer', '资源中心', 'Resources', '/resources', 8),
  ('footer', '捐款支持', 'Donation', '/donate', 9),
  ('footer', '联系我们', 'Contact Us', '/contact', 10);

-- ---------- 12. About Us 子页面 ----------
insert into public.pages (slug, "group", title_zh, title_en, body_zh, body_en, status, published_at, sort_order) values
('overview', 'about', '协会介绍', 'Association Introduction', $zh$
<p>本会定名「美国餐饮业发展协会」，英文名称 American Restaurant Development Association，简称 ARDA。本会依纽约州法律设立登记，为非营利、非政治、非宗教之组织；会址设于纽约州纽约市，可以经董事局决议迁移，会计年度为每年一月一日至十二月三十一日。</p>
<p>本会以促进美国餐饮产业整体发展、提升华人餐饮之行业地位与国际影响力为宗旨：</p>
<h2>八大核心宗旨</h2>
<ul>
<li><strong>凝心聚力：</strong>团结全美华人餐饮从业者，改变单打独斗的局面，凝聚成跨区域、跨族裔的行业共同体</li>
<li><strong>服务企业：</strong>协助会员提升经营能力、开拓市场空间、增强抗风险能力</li>
<li><strong>链通产业：</strong>打通食材、设备、冷链物流与配套服务各个环节，构建高效协同、彼此成就的产业链条</li>
<li><strong>智创未来：</strong>以「AI ＋ 餐饮」为方向，推动人工智能在点餐、厨房、营销与管理各环节的实际应用，帮助会员完成数字化转型</li>
<li><strong>育才储能：</strong>培育餐饮业的管理人才与创新人才，为行业的持续发展储备后备力量</li>
<li><strong>资本赋能：</strong>引入资本的力量为优质企业加码，助其从单店走向连锁、从区域走向规模，乃至进入资本市场</li>
<li><strong>品牌推广：</strong>帮助优质餐饮品牌走出社区、打开市场，从本地做到全美，从美国走向世界</li>
<li><strong>文化传播：</strong>以餐饮为载体传播亚洲饮食文化，让更多人透过食物认识亚洲，促进各族裔之间的交流互鉴</li>
</ul>
<h2>发展定位</h2>
<p>美国餐饮业发展协会致力于成为全美最具影响力的亚裔餐饮行业组织。第一阶段立足华人餐饮，整合品牌、供应链、科技、资本、媒体与社区资源；第二阶段扩展至亚裔餐饮全域，形成跨族裔的产业协作网络；最终建成服务全美餐饮产业、推动全球餐饮交流的国际性行业组织。</p>
<h2>服务对象</h2>
<p>本会之服务对象涵盖各类餐厅经营者、食材与设备供应商、冷链物流企业、餐饮科技与人工智能服务商、餐饮投资机构、教育培训机构，以及餐饮相关领域之创业者与从业人员。</p>
<p class="text-sm text-ink-600">以上内容依据《美国餐饮业发展协会组织章程》第一章「总则」整理；完整条文请见「协会章程」页面。</p>
$zh$, $en$
<p>The Association is named the "American Restaurant Development Association" (ARDA). It is a nonprofit, nonpartisan, nonreligious organization registered under the laws of the State of New York, headquartered in New York City (subject to relocation by Board resolution), with a fiscal year running January 1 to December 31.</p>
<p>ARDA's purpose is to advance the overall development of the U.S. restaurant industry and elevate the standing and international influence of the Chinese restaurant sector:</p>
<h2>Eight Core Purposes</h2>
<ul>
<li><strong>Unity:</strong> Uniting Chinese restaurant professionals nationwide into a cross-regional, cross-ethnic industry community</li>
<li><strong>Business Support:</strong> Helping members strengthen operations, open new markets and build resilience</li>
<li><strong>Industry Connection:</strong> Linking food supply, equipment, cold chain logistics and related services into an efficient, mutually reinforcing chain</li>
<li><strong>Innovation:</strong> Advancing "AI + Restaurant" applications in ordering, kitchen operations, marketing and management to support digital transformation</li>
<li><strong>Talent Development:</strong> Cultivating management and innovation talent to sustain the industry's growth</li>
<li><strong>Capital Access:</strong> Bringing capital to quality companies to help them grow from single stores to chains, from regional to national scale, and toward capital markets</li>
<li><strong>Brand Promotion:</strong> Helping strong brands grow from local communities to national and international markets</li>
<li><strong>Cultural Exchange:</strong> Promoting Asian culinary culture and cross-ethnic exchange through food</li>
</ul>
<h2>Strategic Positioning</h2>
<p>ARDA is building the most influential Asian-American restaurant industry organization in the country. In its first phase, the Association is rooted in the Chinese restaurant community, integrating brands, supply chains, technology, capital, media and community resources. In its second phase, it will expand across the broader Asian-American restaurant sector, forming a cross-ethnic industry network. Ultimately, ARDA aims to become an international industry organization serving the U.S. restaurant industry and advancing global culinary exchange.</p>
<h2>Who We Serve</h2>
<p>Restaurant operators, food and equipment suppliers, cold chain and logistics companies, restaurant technology and AI providers, restaurant investment firms, education and training institutions, and restaurant entrepreneurs and industry professionals.</p>
<p class="text-sm text-ink-600">Adapted from Chapter One ("General Provisions") of the ARDA Bylaws; see the "Bylaws" page for the full text.</p>
$en$, 'published', now(), 1),

('mission-vision', 'about', '使命与愿景', 'Mission & Vision', $zh$
<h2>使命</h2>
<p>凝聚全美餐饮从业者的力量，链通产业上下游资源，以科技与资本赋能行业发展，培育新一代餐饮人才，推动餐饮文化的跨族裔交流。</p>
<h2>愿景</h2>
<p>成为全美最具影响力的亚裔餐饮行业组织，并逐步发展为服务全美餐饮产业、推动全球餐饮交流的国际性行业组织。</p>
$zh$, $en$
<h2>Mission</h2>
<p>To unite restaurant professionals across the United States, connect upstream and downstream industry resources, empower growth through technology and capital, cultivate the next generation of restaurant talent, and advance cross-ethnic culinary and cultural exchange.</p>
<h2>Vision</h2>
<p>To become the most influential Asian-American restaurant industry organization in the country, and to grow into an international industry organization serving the U.S. restaurant industry and global culinary exchange.</p>
$en$, 'published', now(), 2),

('history', 'about', '发展历程', 'History & Milestones', $zh$
<p>美国餐饮业发展协会按照分阶段的发展路径稳步推进：</p>
<h2>第一阶段：立足华人餐饮</h2>
<p>整合餐饮品牌、供应链、科技、资本、媒体和社区资源，建立协会治理架构、专业委员会与地方分会网络。</p>
<h2>第二阶段：扩展至亚裔餐饮全域</h2>
<p>形成跨区域、跨族裔的产业协作网络，扩大会员基础与合作伙伴网络。</p>
<h2>第三阶段：国际化发展</h2>
<p>发展成为服务全美餐饮产业、推动全球餐饮交流的国际性行业组织。</p>
<p class="text-sm text-ink-600">具体里程碑事件将随协会发展在后台持续更新，本页面时间线内容由内容管理员维护。</p>
$zh$, $en$
<p>ARDA is advancing through a phased development path:</p>
<h2>Phase One: Rooted in the Chinese Restaurant Community</h2>
<p>Integrating restaurant brands, supply chains, technology, capital, media and community resources; establishing the Association's governance structure, professional committees and local chapter network.</p>
<h2>Phase Two: Expanding Across the Asian-American Restaurant Sector</h2>
<p>Forming a cross-regional, cross-ethnic industry network and growing the membership base and partner network.</p>
<h2>Phase Three: International Growth</h2>
<p>Growing into an international industry organization serving the U.S. restaurant industry and global culinary exchange.</p>
<p class="text-sm text-ink-600">Specific milestones will be updated here as the Association develops; this timeline is maintained by Content Administrators.</p>
$en$, 'published', now(), 3),

('members', 'about', '协会成员', 'Membership & Members', $zh$
<p>本节依据《美国餐饮业发展协会组织章程》第二章「会员」整理，说明入会资格、会员类别、会费与会员之权利义务。</p>
<h2>入会资格</h2>
<p>凡从事餐饮产业或为其提供服务之企业、机构及个人，认同本会宗旨者，均可申请入会，包括各类餐厅经营者、食材与设备供应商及冷链物流等供应链企业、餐饮科技与人工智能服务商、餐饮投资机构、教育培训机构，以及餐饮相关领域之企业家。入会申请经董事局或其授权之秘书处审核通过后生效。</p>
<h2>会员类别</h2>
<p>本会设创会会员、企业会员、个人会员、专业会员、合作会员及荣誉会员，各类别之适用条件由董事局订定。具体各类别的权益说明请见「会员中心」的「会员类别」页面。</p>
<h2>会费</h2>
<p>本会现阶段不向会员收取会费。日后是否收取会费、其标准与缴纳方式，由董事局决议后公告实施。</p>
<h2>会员之权利与义务</h2>
<p>会员可以参加本会各项活动、论坛、培训及交流，可以参与各专业委员会与地方分会之工作，并可以受邀出席年度会员大会表达意见。会员应遵守本章程、诚信经营、维护本会声誉，并支持本会各项工作。本会之治理权属于董事局，会员不因其会员身分而取得本会之管理权或财产权。</p>
<h2>退会与除名</h2>
<p>会员可以随时以书面通知退会。会员之行为损害本会声誉、违反本章程或相关法令者，经董事局出席董事三分之二以上同意，可以终止其会员资格；终止前应给予其书面说明之机会。</p>
<p class="text-sm text-ink-600">以上内容依据《美国餐饮业发展协会组织章程》第二章「会员」（第六条至第十条）整理；完整条文请见「协会章程」页面。如有意申请入会，请前往「申请入会」页面提交申请。</p>
$zh$, $en$
<p>Adapted from Chapter Two ("Membership") of the ARDA Bylaws, covering eligibility, membership categories, dues, and members' rights and obligations.</p>
<h2>Eligibility</h2>
<p>Any enterprise, organization or individual engaged in, or providing services to, the restaurant industry — including restaurant operators, food and equipment suppliers, cold-chain and logistics companies, restaurant technology and AI providers, restaurant investment firms, education and training institutions, and industry entrepreneurs — who supports the Association's purpose may apply for membership. Applications take effect once approved by the Board of Directors or its authorized Secretariat.</p>
<h2>Membership Categories</h2>
<p>The Association recognizes Founding Members, Corporate Members, Individual Members, Professional Members, Partner Members and Honorary Members. Eligibility criteria for each category are set by the Board of Directors. See "Membership Types" under the Membership Center for details.</p>
<h2>Dues</h2>
<p>The Association does not currently charge membership dues. Whether dues will be introduced in the future, and at what rate and payment method, will be decided by Board resolution and announced accordingly.</p>
<h2>Members' Rights and Obligations</h2>
<p>Members may participate in the Association's activities, forums, training and exchanges, take part in the work of professional committees and local chapters, and attend the annual General Assembly to express their views. Members shall observe these Bylaws, operate with integrity, uphold the Association's reputation, and support its work. Governance authority rests with the Board of Directors; membership status alone does not confer management or property rights in the Association.</p>
<h2>Withdrawal and Expulsion</h2>
<p>A member may withdraw at any time by written notice. Where a member's conduct damages the Association's reputation or violates these Bylaws or applicable law, membership may be terminated upon the affirmative vote of at least two-thirds of the directors present, provided the member is given an opportunity for written explanation beforehand.</p>
<p class="text-sm text-ink-600">Adapted from Chapter Two ("Membership"), Articles 6–10, of the ARDA Bylaws; see the "Bylaws" page for the full text. To apply for membership, please visit the "Apply for Membership" page.</p>
$en$, 'published', now(), 4),

('bylaws', 'about', '协会章程', 'Bylaws', $zh$
<p class="text-sm text-ink-600">美国餐饮业发展协会组织章程　版本 35　2026 年 8 月 23 日</p>
<h2>第一章　总则</h2>
<h3>第一条　名称</h3>
<p>本会定名「美国餐饮业发展协会」，英文名称 American Restaurant Development Association，简称 ARDA。</p>
<h3>第二条　性质</h3>
<p>本会依纽约州法律设立登记，为非营利、非政治、非宗教之组织。</p>
<h3>第三条　宗旨</h3>
<p>本会以促进美国餐饮产业整体发展、提升华人餐饮之行业地位与国际影响力为宗旨，具体为：</p>
<ul>
<li>凝心聚力——团结全美华人餐饮从业者，改变单打独斗的局面，凝聚成跨区域、跨族裔的行业共同体。</li>
<li>服务企业——协助会员提升经营能力、开拓市场空间、增强抗风险能力。</li>
<li>链通产业——打通食材、设备、冷链物流与配套服务各个环节，构建高效协同、彼此成就的产业链条。</li>
<li>智创未来——以「AI ＋ 餐饮」为方向，推动人工智能在点餐、厨房、营销与管理各环节的实际应用，帮助会员完成数字化转型。</li>
<li>育才储能——培育餐饮业的管理人才与创新人才，为行业的持续发展储备后备力量。</li>
<li>资本赋能——引入资本的力量为优质企业加码，助其从单店走向连锁、从区域走向规模，乃至进入资本市场。</li>
<li>品牌推广——帮助优质餐饮品牌走出社区、打开市场，从本地做到全美，从美国走向世界。</li>
<li>文化传播——以餐饮为载体传播亚洲饮食文化，让更多人透过食物认识亚洲，促进各族裔之间的交流互鉴。</li>
</ul>
<h3>第四条　定位</h3>
<p>美国餐饮业发展协会致力于成为全美最具影响力的亚裔餐饮行业组织。第一阶段立足华人餐饮，整合品牌、供应链、科技、资本、媒体与社区资源；第二阶段扩展至亚裔餐饮全域，形成跨族裔的产业协作网络；最终建成服务全美餐饮产业、推动全球餐饮交流的国际性行业组织。</p>
<p>本会之服务对象涵盖各类餐厅经营者、食材与设备供应商、冷链物流企业、餐饮科技与人工智能服务商、餐饮投资机构、教育培训机构，以及餐饮相关领域之创业者与从业人员。</p>
<h3>第五条　会所及会计年度</h3>
<p>本会会址设于纽约州纽约市，可以经董事局决议迁移。会计年度为每年一月一日至十二月三十一日。</p>

<h2>第二章　会员</h2>
<h3>第六条　入会资格</h3>
<p>凡从事餐饮产业或为其提供服务之企业、机构及个人，认同本会宗旨者，均可申请入会，包括各类餐厅经营者、食材与设备供应商及冷链物流等供应链企业、餐饮科技与人工智能服务商、餐饮投资机构、教育培训机构，以及餐饮相关领域之企业家。入会申请经董事局或其授权之秘书处审核通过后生效。</p>
<h3>第七条　会员类别</h3>
<p>本会设创会会员、企业会员、个人会员、专业会员、合作会员及荣誉会员，各类别之适用条件由董事局订定。</p>
<h3>第八条　会费</h3>
<p>本会现阶段不向会员收取会费。日后是否收取会费、其标准与缴纳方式，由董事局决议后公告实施。</p>
<h3>第九条　会员之权利与义务</h3>
<p>会员可以参加本会各项活动、论坛、培训及交流，可以参与各专业委员会与地方分会之工作，并可以受邀出席年度会员大会表达意见。会员应遵守本章程、诚信经营、维护本会声誉，并支持本会各项工作。本会之治理权属于董事局，会员不因其会员身分而取得本会之管理权或财产权。</p>
<h3>第十条　退会与除名</h3>
<p>会员可以随时以书面通知退会。会员之行为损害本会声誉、违反本章程或相关法令者，经董事局出席董事三分之二以上同意，可以终止其会员资格；终止前应给予其书面说明之机会。</p>

<h2>第三章　治理架构</h2>
<h3>第十一条　架构</h3>
<p>本会治理架构为：会员大会 → 董事局 → 执行理事会 → 秘书处、办公室及各部门，并设监事会行使监督；下设各专业委员会、地方分会及行业联盟。董事局为本会最高决策机构；执行理事会负责执行董事局决议并统筹日常会务；秘书处、办公室及各部门办理各项行政与专业事务。</p>
<h3>第十二条　会员大会</h3>
<p>会员大会由全体会员组成，每年至少召开一次，由董事局召集，开会通知应于十四日前送达。会员大会听取年度工作与财务报告，选举董事与监事长，并就本会重大事项表达意见。</p>

<h2>第四章　董事局</h2>
<h3>第十三条　职权</h3>
<p>董事局为本会最高决策机构，掌理本会一切事务，包括制定发展方向、核定年度工作计划与预算、批准重大合作及对外签约、监督财务运作、选举及任免各项职位、设立或调整执行理事会与各专业委员会、地方分会及行业联盟、聘任及考核秘书长与各部门负责人，并订定会员入会与除名之细则。</p>
<h3>第十四条　组成与任期</h3>
<p>董事局置董事若干人，其人数由董事局决议定之，但不得少于三人。董事由会员大会选举产生，任期三年，可以连选连任，连任不得逾两届。职员、顾问及会员不因其身分而当然取得董事身分。</p>
<h3>第十五条　表决权</h3>
<p>董事局成员每人一票，不得委托代理行使。受邀列席董事局会议之职员、顾问及会员，无表决权。</p>
<h3>第十六条　会议</h3>
<p>董事局每年至少召开四次会议，由主席召集，开会通知应于七日前送达。须全体董事过半数出席方可开议，决议以出席董事过半数同意行之；本章程另有三分之二规定者，从其规定。会议应作成会议纪录并留存备查。</p>
<h3>第十七条　出缺、辞任与解任</h3>
<p>董事可以随时以书面辞任。董事辞任、因故不能继续履行职务，或连续三次无故缺席会议者，其席位视为出缺，由董事局遴选补实至原任期届满，并提请次届会员大会追认。董事重大违反本章程或损害本会利益者，经全体董事三分之二以上同意，可以予以解任；解任前应给予其说明之机会。</p>

<h2>第五章　职位与选任</h2>
<h3>第十八条　职位设置</h3>
<p>本会设主席、共同主席、执行主席、副主席、监事长、秘书长、副秘书长、办公室主任、主席助理及国际合作发展事务官；另设荣誉主席、总顾问、荣誉顾问及特聘顾问等顾问职位。</p>
<h3>第十九条　选任办法</h3>
<ul>
<li>董事：由会员大会选举产生。</li>
<li>主席：由董事局于董事中选举产生，任期三年，可以连任一次，最长不逾连续六年；卸任后自动转任荣誉主席或顾问序列。</li>
<li>共同主席、执行主席、副主席：由主席提名，经董事局表决通过后任命，任期三年，可以连任。</li>
<li>监事长：由会员大会选举产生，任期三年。</li>
<li>秘书长、副秘书长、办公室主任、主席助理、国际合作发展事务官：由主席提名，经董事局表决聘任。副秘书长可以设置若干人。</li>
<li>各部门负责人：由秘书长提名，经董事局表决聘任。</li>
<li>各专业委员会召集人：由主席提名，经董事局表决聘任，任期两年，可以连任。</li>
<li>荣誉主席、总顾问、荣誉顾问、特聘顾问：由主席提名，经董事局决议聘请。</li>
</ul>
<h3>第二十条　解任</h3>
<p>职员及各专业委员会召集人有不适任情事者，经董事局出席董事过半数同意，可以随时解任；出缺时依第十九条程序补实。</p>
<h3>第二十一条　职责</h3>
<p>主席对外代表本会，主持董事局会议，统筹年度工作之推动。共同主席协同主席推动会务发展、对外合作及重大项目落地。执行主席协助督导本会日常运作及各项决议之执行。副主席协助主席推动会务，并可以经董事局指派驻各州，负责当地会员发展与地方联络。监事长监督本会决议执行、财务运作及法规遵循，并每年提出监察报告。秘书长综理秘书处行政、会议纪录、会员管理及各部门统筹；副秘书长协助秘书长，并于秘书长不能视事时代行其职务。办公室主任负责日常行政协调。主席助理协助主席处理会务事宜及对外联络。国际合作发展事务官负责国际合作伙伴之开发与对外合作关系之建立与维护。</p>

<h2>第六章　执行理事会</h2>
<h3>第二十二条　组成与职权</h3>
<p>本会设执行理事会，由主席、共同主席、监事长、执行主席、秘书长、副秘书长、办公室主任、主席助理及副主席组成；荣誉主席及顾问委员会成员可以列席，不具表决权。执行理事会负责执行董事局决议、统筹年度工作之推动，并督导秘书处、办公室、各部门及各专业委员会之日常运作。</p>
<h3>第二十三条　会议</h3>
<p>执行理事会每年至少召开四次，由主席或执行主席召集，开会通知应于七日前送达；须过半数成员出席方可开议，决议以出席成员过半数同意行之，并应作成会议纪录。执行理事会之决议不得抵触董事局决议，重大事项应提报董事局核定。</p>

<h2>第七章　监事会</h2>
<h3>第二十四条　组成与职权</h3>
<p>本会设监事会，设监事长一人，由会员大会选举产生；会员大会可以另选任监事若干人与监事长共同行使职权。监事会监督董事局决议之执行、财务运作及法规遵循，并每年提出监察报告。监事会发现有损害本会利益或违反法令、章程之情事者，可以要求董事局限期改正；届期未改正者，可以提请会员大会处理。涉及监事长本人参与之事项，监事长应予揭露并回避该项监察决定。</p>

<h2>第八章　秘书处、办公室及各部门</h2>
<h3>第二十五条　秘书处</h3>
<p>秘书处设秘书长一人、副秘书长若干人，综理本会日常行政。</p>
<h3>第二十六条　办公室及各部门职掌</h3>
<p>本会设办公室及财务与基金部、国际事务与战略合作部、品牌宣传公关部、法务部。办公室负责综合行政、文件管理及活动执行支持。财务与基金部负责年度预算与决算、资金收支管理、账户管理及财务报表之编制。国际事务与战略合作部负责国际合作、海外市场对接、国际展会及商务考察之安排。品牌宣传公关部负责品牌推广、媒体关系、内容制作、社群经营及活动宣传。法务部负责合约审阅、法规遵循及争议处理之协调。</p>

<h2>第九章　专业委员会</h2>
<h3>第二十七条　常设委员会</h3>
<p>本会设六个常设专业委员会：</p>
<ul>
<li>品牌连锁委员会——品牌打造、连锁经营、品牌授权、市场推广。</li>
<li>供应链委员会——食材采购、冷链物流、食品安全、原材料供应。</li>
<li>科技与 AI 委员会——智能点餐、智慧厨房、智能行销、数据分析、机器人应用。</li>
<li>资本投资委员会——餐饮融资、股权投资、连锁加盟、上市咨询。</li>
<li>法律政策委员会——食品法规、卫生标准、劳动与合规、行业政策研究。</li>
<li>新生代餐饮创业委员会——新生代创业辅导、人才培育、教育培训、高管研修。</li>
</ul>
<h3>第二十八条　组成与运作</h3>
<p>各委员会设召集人一名，依第十九条第七款产生；成员由召集人提名，经董事局核备后聘任。各委员会应提报年度工作计划与成果，其决议属建议性质，重大事项应提报董事局核定。董事局可以视需要增设、调整或裁撤委员会。</p>

<h2>第十章　地方分会与行业联盟</h2>
<h3>第二十九条　地方分会</h3>
<p>本会可以经董事局决议设立地方分会，包括纽约、加州、德州、佛州、新泽西、伊利诺伊、华盛顿州、波士顿、拉斯维加斯、夏威夷等地及海外合作机构。分会应接受董事局监督，其负责人任免及年度计划应报董事局核备；不得逾越授权范围对外行动、单独募款或签约；财务并入本会统一管理。</p>
<h3>第三十条　行业联盟</h3>
<p>本会可以结合会员及相关企业发起或加入行业联盟。各联盟不具独立法人资格，其运作规则由董事局另订，对外行为应于授权范围内进行，财务及重大决议应报董事局备查。</p>

<h2>第十一章　顾问委员会</h2>
<h3>第三十一条　组成与职权</h3>
<p>本会设顾问委员会，经董事局决议聘请总顾问、特聘顾问及荣誉顾问组成，人选可以包括餐饮企业家、商界领袖、法律／会计／金融专业人士、大学教授、社区领袖及媒体代表。顾问委员会就本会发展方向及重大议案提供咨询建议，不参与本会之治理与日常管理，亦无表决权。</p>

<h2>第十二章　财务</h2>
<h3>第三十二条　经费与管理</h3>
<p>本会经费来源包括捐赠、赞助、补助、活动收入及其他合法收入，全部用于达成本会宗旨。本会应于金融机构开立专用账户，支出应依董事局核定之授权程序办理。财务与基金部应每季度向董事局提交财务报表，并编制年度预算及年度财务报表送董事局核定，每年向会员公开财务报告；必要时可以委请独立会计师查核。</p>
<h3>第三十三条　利益冲突</h3>
<p>董事、职员及委员会成员就本会拟议之交易具有直接或间接财务利益者，应向董事局揭露并回避该事项之讨论与表决，由无利害关系董事以过半数决定是否符合本会最佳利益，并载明于会议纪录。</p>

<h2>第十三章　附则</h2>
<h3>第三十四条　章程之修订</h3>
<p>本章程之修订，须经全体董事三分之二以上同意。</p>
<h3>第三十五条　施行</h3>
<p>本章程经董事局通过后施行，修订时亦同。本章程未尽事项，由董事局决议办理。</p>

<h2>附一　组织架构总表</h2>
<p><strong>一、治理层：</strong>会员大会（全体会员）→ 董事局 Board of Directors（最高决策机构）→ 执行理事会（执行董事局决议、统筹日常会务）与监事会（监事长；监督决议执行、财务运作及法规遵循）。</p>
<p><strong>二、秘书处、办公室及各部门：</strong>秘书处（秘书长、副秘书长，综理日常行政）；办公室（办公室主任，综合行政、文件管理、活动执行支持），下辖财务与基金部（预决算、资金收支、账户管理、财务报表）、国际事务与战略合作部（国际合作、海外市场对接、国际展会、商务考察）、品牌宣传公关部（品牌推广、媒体关系、内容制作、社群经营）、法务部（合约审阅、法规遵循、争议处理协调）。另设国际合作发展事务官，负责国际合作伙伴之开发与对外合作关系之建立与维护。</p>
<p><strong>三、六个常设专业委员会：</strong>品牌连锁委员会、供应链委员会、科技与 AI 委员会、资本投资委员会、法律政策委员会、新生代餐饮创业委员会。</p>
<p><strong>四、顾问委员会：</strong>总顾问、特聘顾问、荣誉顾问；另设荣誉主席。顾问不参与治理与日常管理，无表决权。</p>
<p><strong>五、地方分会与行业联盟：</strong>地方分会包括纽约、加州、德州、佛州、新泽西、伊利诺伊、华盛顿州、波士顿、拉斯维加斯、夏威夷及海外合作机构；行业联盟由本会结合会员及相关企业发起或加入，不具独立法人资格，运作规则由董事局另订。</p>
<p class="text-sm text-ink-600">附一的可视化架构图请见「协会构架」页面。</p>
$zh$, $en$
<p class="text-sm text-ink-600">ARDA Bylaws — Version 35, August 23, 2026. English rendering for reference; the Chinese original governs in case of any discrepancy.</p>
<h2>Chapter 1 — General Provisions</h2>
<h3>Article 1 — Name</h3>
<p>The Association is named the "American Restaurant Development Association" (ARDA).</p>
<h3>Article 2 — Nature</h3>
<p>The Association is registered under the laws of the State of New York as a nonprofit, nonpartisan, nonreligious organization.</p>
<h3>Article 3 — Purpose</h3>
<p>The Association's purpose is to advance the overall development of the U.S. restaurant industry and elevate the standing and international influence of the Chinese restaurant sector, specifically:</p>
<ul>
<li>Unity — uniting Chinese restaurant professionals nationwide into a cross-regional, cross-ethnic industry community.</li>
<li>Business Support — helping members strengthen operations, open markets and build resilience.</li>
<li>Industry Connection — linking food supply, equipment, cold-chain logistics and related services into an efficient, mutually reinforcing chain.</li>
<li>Innovation — advancing "AI + Restaurant" applications in ordering, kitchen operations, marketing and management, supporting digital transformation.</li>
<li>Talent Development — cultivating management and innovation talent for the industry's sustained growth.</li>
<li>Capital Access — bringing capital to quality companies to help them scale from single stores to chains and toward capital markets.</li>
<li>Brand Promotion — helping strong brands grow from local communities to national and international markets.</li>
<li>Cultural Exchange — promoting Asian culinary culture and cross-ethnic exchange through food.</li>
</ul>
<h3>Article 4 — Positioning</h3>
<p>ARDA is building the most influential Asian-American restaurant industry organization in the country. Phase One is rooted in the Chinese restaurant community, integrating brands, supply chains, technology, capital, media and community resources; Phase Two expands across the broader Asian-American restaurant sector into a cross-ethnic industry network; ultimately ARDA aims to become an international organization serving the U.S. restaurant industry and advancing global culinary exchange.</p>
<p>The Association serves restaurant operators, food and equipment suppliers, cold-chain logistics companies, restaurant technology and AI providers, restaurant investment firms, education and training institutions, and industry entrepreneurs and professionals.</p>
<h3>Article 5 — Office and Fiscal Year</h3>
<p>The Association's office is located in New York City, New York, and may be relocated by Board resolution. The fiscal year runs from January 1 to December 31.</p>

<h2>Chapter 2 — Membership</h2>
<h3>Article 6 — Eligibility</h3>
<p>Any enterprise, organization or individual engaged in, or providing services to, the restaurant industry who supports the Association's purpose may apply for membership; applications take effect upon approval by the Board of Directors or its authorized Secretariat.</p>
<h3>Article 7 — Membership Categories</h3>
<p>The Association recognizes Founding, Corporate, Individual, Professional, Partner and Honorary Members, with eligibility criteria set by the Board.</p>
<h3>Article 8 — Dues</h3>
<p>The Association does not currently charge dues. Any future introduction of dues, rates and payment methods will be decided by Board resolution and announced.</p>
<h3>Article 9 — Members' Rights and Obligations</h3>
<p>Members may participate in activities, forums, training and exchanges, take part in committees and chapters, and attend the annual General Assembly. Members shall observe these Bylaws, act with integrity, and uphold the Association's reputation. Governance authority rests with the Board; membership alone confers no management or property rights.</p>
<h3>Article 10 — Withdrawal and Expulsion</h3>
<p>A member may withdraw at any time by written notice. Membership may be terminated by a two-thirds vote of directors present where conduct damages the Association's reputation or violates these Bylaws or law, with an opportunity for written explanation beforehand.</p>

<h2>Chapter 3 — Governance Structure</h2>
<h3>Article 11 — Structure</h3>
<p>The governance structure is: General Assembly → Board of Directors → Executive Council → Secretariat, Office and departments, with an independent Supervisory Board; standing committees, local chapters and industry alliances operate beneath this structure. The Board is the highest decision-making body; the Executive Council implements Board decisions and coordinates daily affairs; the Secretariat, Office and departments handle administrative and professional matters.</p>
<h3>Article 12 — General Assembly</h3>
<p>The General Assembly comprises all members and convenes at least once annually, called by the Board with 14 days' notice. It hears annual work and financial reports, elects directors and the Chair of the Supervisory Board, and expresses views on major matters.</p>

<h2>Chapter 4 — Board of Directors</h2>
<h3>Article 13 — Authority</h3>
<p>The Board is the highest decision-making body, responsible for setting strategic direction, approving the annual plan and budget, approving major partnerships and contracts, overseeing financial operations, electing and removing officers, establishing or adjusting the Executive Council, committees, chapters and alliances, appointing and evaluating the Secretary General and department heads, and setting rules for admission and expulsion of members.</p>
<h3>Article 14 — Composition and Term</h3>
<p>The Board consists of a number of directors (no fewer than three) as the Board determines, elected by the General Assembly for three-year terms, renewable but not exceeding two consecutive terms. Holding a staff, advisory or membership role does not by itself confer director status.</p>
<h3>Article 15 — Voting Rights</h3>
<p>Each director has one vote, non-delegable. Staff, advisors and members invited to attend Board meetings have no vote.</p>
<h3>Article 16 — Meetings</h3>
<p>The Board meets at least four times annually, called by the Chair with 7 days' notice. A quorum requires a majority of all directors; resolutions require a majority of directors present, except where these Bylaws require a two-thirds vote. Minutes shall be kept on file.</p>
<h3>Article 17 — Vacancies, Resignation and Removal</h3>
<p>A director may resign in writing at any time. A seat is deemed vacant upon resignation, incapacity, or three consecutive unexcused absences; the Board fills the vacancy for the remainder of the term, subject to ratification at the next General Assembly. A director may be removed by a two-thirds vote of all directors for serious violations of these Bylaws or harm to the Association's interests, with an opportunity to be heard beforehand.</p>

<h2>Chapter 5 — Officers and Appointments</h2>
<h3>Article 18 — Positions</h3>
<p>The Association has a President, Co-Chairs, Executive Vice President, Vice Presidents, Chair of the Supervisory Board, Secretary General, Deputy Secretary General(s), Office Director, Assistant to the President, and Partnership Development Officer; and advisory positions of Honorary President, Chief Advisor, Honorary Advisor and Distinguished Advisor.</p>
<h3>Article 19 — Appointment Procedures</h3>
<ul>
<li>Directors: elected by the General Assembly.</li>
<li>President: elected by the Board from among directors, three-year term, renewable once (maximum six consecutive years); transitions to Honorary President or an advisory role upon leaving office.</li>
<li>Co-Chairs, Executive Vice President, Vice Presidents: nominated by the President, appointed upon Board approval, three-year terms, renewable.</li>
<li>Chair of the Supervisory Board: elected by the General Assembly, three-year term.</li>
<li>Secretary General, Deputy Secretary General(s), Office Director, Assistant to the President, Partnership Development Officer: nominated by the President, appointed upon Board approval; multiple Deputy Secretaries General may be appointed.</li>
<li>Department heads: nominated by the Secretary General, appointed upon Board approval.</li>
<li>Committee conveners: nominated by the President, appointed upon Board approval, two-year terms, renewable.</li>
<li>Honorary President, Chief Advisor, Honorary Advisor, Distinguished Advisor: nominated by the President and engaged by Board resolution.</li>
</ul>
<h3>Article 20 — Removal</h3>
<p>Officers and committee conveners found unfit for their roles may be removed at any time by a majority vote of directors present; vacancies are filled per Article 19.</p>
<h3>Article 21 — Duties</h3>
<p>The President represents the Association externally, chairs Board meetings, and coordinates the annual work plan. Co-Chairs assist in advancing operations, external partnerships and major projects. The Executive Vice President helps oversee daily operations and implementation of resolutions. Vice Presidents assist the President and may be assigned by the Board to specific states to lead local member development and liaison. The Chair of the Supervisory Board oversees implementation of resolutions, financial operations and compliance, reporting annually. The Secretary General oversees Secretariat administration, meeting minutes, membership management and department coordination; the Deputy Secretary/Secretaries General assist and may act in the Secretary General's absence. The Office Director handles daily administrative coordination. The Assistant to the President supports the President's affairs and external liaison. The Partnership Development Officer develops and maintains international partnerships.</p>

<h2>Chapter 6 — Executive Council</h2>
<h3>Article 22 — Composition and Authority</h3>
<p>The Executive Council comprises the President, Co-Chairs, Chair of the Supervisory Board, Executive Vice President, Secretary General, Deputy Secretary/Secretaries General, Office Director, Assistant to the President and Vice Presidents; the Honorary President and Advisory Committee members may attend without voting rights. The Council implements Board resolutions, coordinates the annual work plan, and oversees the Secretariat, Office, departments and committees.</p>
<h3>Article 23 — Meetings</h3>
<p>The Council meets at least four times annually, called by the President or Executive Vice President with 7 days' notice; a majority of members constitutes a quorum, and resolutions require a majority of those present, recorded in minutes. Council resolutions may not conflict with Board resolutions; major matters are reported to the Board for approval.</p>

<h2>Chapter 7 — Supervisory Board</h2>
<h3>Article 24 — Composition and Authority</h3>
<p>The Association has a Supervisory Board led by a Chair elected by the General Assembly, which may also elect additional supervisors. The Supervisory Board oversees implementation of Board resolutions, financial operations and regulatory compliance, reporting annually. Where it finds conduct harmful to the Association's interests or in violation of law or these Bylaws, it may require the Board to correct the matter within a set period, and may refer uncorrected matters to the General Assembly. On matters involving the Chair personally, the Chair shall disclose the conflict and recuse from that decision.</p>

<h2>Chapter 8 — Secretariat, Office and Departments</h2>
<h3>Article 25 — Secretariat</h3>
<p>The Secretariat, led by the Secretary General with one or more Deputy Secretaries General, handles the Association's daily administration.</p>
<h3>Article 26 — Office and Department Functions</h3>
<p>The Association maintains an Office and four departments: Finance & Fund, International Affairs & Strategic Partnership, Branding & Public Relations, and Legal. The Office handles general administration, document management and event support. Finance & Fund manages the annual budget, cash flow, accounts and financial reporting. International Affairs & Strategic Partnership handles international cooperation, overseas market engagement, international events and business delegations. Branding & Public Relations manages brand promotion, media relations, content production, community engagement and event publicity. Legal coordinates contract review, regulatory compliance and dispute handling.</p>

<h2>Chapter 9 — Professional Committees</h2>
<h3>Article 27 — Standing Committees</h3>
<p>The Association maintains six standing professional committees:</p>
<ul>
<li>Branding & Franchise Committee — brand building, franchise operations, brand licensing, market promotion.</li>
<li>Supply Chain Committee — food sourcing, cold-chain logistics, food safety, raw material supply.</li>
<li>Technology & AI Committee — smart ordering, smart kitchens, intelligent marketing, data analytics, robotics applications.</li>
<li>Capital & Investment Committee — restaurant financing, equity investment, franchise expansion, listing advisory.</li>
<li>Legal & Policy Committee — food regulations, health standards, labor compliance, industry policy research.</li>
<li>Next-Generation Restaurateurs & Entrepreneurship Committee — mentoring new entrepreneurs, talent development, training, executive education.</li>
</ul>
<h3>Article 28 — Composition and Operation</h3>
<p>Each committee has one convener, appointed per Article 19(7); members are nominated by the convener and appointed upon Board record. Committees report annual work plans and outcomes; their resolutions are advisory, with major matters reported to the Board for approval. The Board may establish, adjust or dissolve committees as needed.</p>

<h2>Chapter 10 — Local Chapters and Industry Alliances</h2>
<h3>Article 29 — Local Chapters</h3>
<p>The Board may establish local chapters by resolution, including in New York, California, Texas, Florida, New Jersey, Illinois, Washington State, Boston, Las Vegas, Hawaii, and overseas partner organizations. Chapters are subject to Board oversight; leadership appointments and annual plans are reported to the Board; chapters may not act, fundraise or contract beyond their authorized scope, and finances are consolidated under the Association's unified management.</p>
<h3>Article 30 — Industry Alliances</h3>
<p>The Association may form or join industry alliances with members and related enterprises. Alliances have no independent legal status; their operating rules are set separately by the Board, external actions must remain within authorized scope, and finances and major resolutions are reported to the Board.</p>

<h2>Chapter 11 — Advisory Committee</h2>
<h3>Article 31 — Composition and Authority</h3>
<p>The Association maintains an Advisory Committee, engaged by Board resolution, comprising a Chief Advisor, Distinguished Advisors and Honorary Advisors — potentially including restaurant entrepreneurs, business leaders, legal/accounting/financial professionals, academics, community leaders and media representatives. The Advisory Committee provides counsel on strategic direction and major matters, but does not participate in governance or daily management and holds no voting rights.</p>

<h2>Chapter 12 — Finance</h2>
<h3>Article 32 — Funding and Management</h3>
<p>Association funding comes from donations, sponsorships, grants, event revenue and other lawful income, used entirely to fulfill the Association's purpose. The Association maintains a dedicated account at a financial institution; expenditures follow Board-approved authorization procedures. Finance & Fund submits quarterly financial reports to the Board, prepares the annual budget and financial statements for Board approval, and discloses an annual financial report to members; independent audits may be commissioned as needed.</p>
<h3>Article 33 — Conflicts of Interest</h3>
<p>Directors, officers and committee members with a direct or indirect financial interest in a proposed transaction shall disclose it to the Board and recuse from discussion and voting on that matter; disinterested directors determine by majority vote whether the matter serves the Association's best interests, recorded in the minutes.</p>

<h2>Chapter 13 — Supplementary Provisions</h2>
<h3>Article 34 — Amendment</h3>
<p>Amendments to these Bylaws require the affirmative vote of at least two-thirds of all directors.</p>
<h3>Article 35 — Effective Date</h3>
<p>These Bylaws take effect upon adoption by the Board, and likewise upon any amendment. Matters not addressed herein are resolved by Board decision.</p>

<h2>Appendix 1 — Organizational Structure Summary</h2>
<p><strong>1. Governance:</strong> General Assembly (all members) → Board of Directors (highest decision-making body) → Executive Council (implements Board resolutions, coordinates daily affairs) and Supervisory Board (Chair; oversees implementation, finances and compliance).</p>
<p><strong>2. Secretariat, Office and Departments:</strong> Secretariat (Secretary General, Deputy Secretary/Secretaries General); Office (Office Director), overseeing Finance & Fund, International Affairs & Strategic Partnership, Branding & Public Relations, and Legal. A Partnership Development Officer develops and maintains international partnerships.</p>
<p><strong>3. Six Standing Committees:</strong> Branding & Franchise, Supply Chain, Technology & AI, Capital & Investment, Legal & Policy, and Next-Generation Restaurateurs & Entrepreneurship.</p>
<p><strong>4. Advisory Committee:</strong> Chief Advisor, Distinguished Advisors, Honorary Advisors; plus an Honorary President. Advisors do not participate in governance or daily management and hold no vote.</p>
<p><strong>5. Local Chapters and Alliances:</strong> Chapters in New York, California, Texas, Florida, New Jersey, Illinois, Washington State, Boston, Las Vegas, Hawaii, and overseas partners; industry alliances formed or joined by the Association, with no independent legal status, operating rules set separately by the Board.</p>
<p class="text-sm text-ink-600">See the "Association Structure" page for a visual organization chart based on Appendix 1.</p>
$en$, 'published', now(), 5),

('governance', 'about', '治理与透明度', 'Transparency & Governance', $zh$
<p>协会治理架构为：会员大会 → 董事局（最高决策机构）→ 执行理事会 → 秘书处、办公室及各部门。同时设立独立监事会，负责监督董事局决议执行、财务运作及法规遵循。</p>
<h2>治理原则</h2>
<ul>
<li>重大事项由会员大会与董事局依章程审议决策</li>
<li>执行理事会负责日常运营的统筹执行</li>
<li>秘书处、办公室及各部门负责具体业务落地</li>
<li>监事会独立监督决议执行、财务运作与法规遵循</li>
</ul>
<p>财务透明度相关说明请参阅"捐赠支持"页面及"财务透明度"法律页面。</p>
$zh$, $en$
<p>ARDA's governance structure is: General Assembly → Board of Directors (the highest decision-making body) → Executive Council → Secretariat, Office and departments. An independent Supervisory Board oversees the implementation of Board decisions, financial operations and regulatory compliance.</p>
<h2>Governance Principles</h2>
<ul>
<li>Major decisions are deliberated and approved by the General Assembly and Board of Directors per the Bylaws</li>
<li>The Executive Council coordinates day-to-day operations</li>
<li>The Secretariat, Office and departments carry out day-to-day business</li>
<li>The Supervisory Board independently oversees decision implementation, financial operations and regulatory compliance</li>
</ul>
<p>For financial transparency details, please see the Donate page and the Financial Transparency legal page.</p>
$en$, 'published', now(), 6),

('organization-structure', 'about', '协会构架', 'Association Structure', $zh$
<p>本页依据《美国餐饮业发展协会组织章程》附一「组织架构总表」整理，自会员大会至各专业部门层级清晰，可视化结构图见下方。</p>
<h2>一、治理层</h2>
<p>会员大会（全体会员）→ 董事局 Board of Directors（最高决策机构）→ 执行理事会（执行董事局决议、统筹日常会务）与监事会（监事长；监督决议执行、财务运作及法规遵循）。</p>
<h2>二、秘书处、办公室及各部门</h2>
<p>秘书处（秘书长、副秘书长）综理日常行政；办公室（办公室主任）负责综合行政、文件管理及活动执行支持，下辖财务与基金部、国际事务与战略合作部、品牌宣传公关部、法务部。另设国际合作发展事务官，负责国际合作伙伴之开发与对外合作关系之建立与维护。</p>
<h2>三、六个常设专业委员会</h2>
<p>品牌连锁委员会、供应链委员会、科技与 AI 委员会、资本投资委员会、法律政策委员会、新生代餐饮创业委员会。</p>
<h2>四、顾问委员会</h2>
<p>总顾问、特聘顾问、荣誉顾问；另设荣誉主席。顾问不参与治理与日常管理，无表决权。</p>
<h2>五、地方分会与行业联盟</h2>
<p>地方分会：纽约、加州、德州、佛州、新泽西、伊利诺伊、华盛顿州、波士顿、拉斯维加斯、夏威夷及海外合作机构。行业联盟由本会结合会员及相关企业发起或加入，不具独立法人资格，运作规则由董事局另订。</p>
<p class="text-sm text-ink-600">完整条文请见「协会章程」页面第三章至第十一章。</p>
$zh$, $en$
<p>Adapted from Appendix 1 ("Organizational Structure Summary") of the ARDA Bylaws. The Association's structure runs from the General Assembly down to individual departments; a visual chart appears below.</p>
<h2>1. Governance</h2>
<p>General Assembly (all members) → Board of Directors (highest decision-making body) → Executive Council (implements Board resolutions, coordinates daily affairs) and Supervisory Board (Chair; oversees implementation, finances and compliance).</p>
<h2>2. Secretariat, Office and Departments</h2>
<p>Secretariat (Secretary General, Deputy Secretary/Secretaries General) handles daily administration; Office (Office Director) provides general administration, document management and event support, overseeing Finance & Fund, International Affairs & Strategic Partnership, Branding & Public Relations, and Legal. A Partnership Development Officer develops and maintains international partnerships.</p>
<h2>3. Six Standing Committees</h2>
<p>Branding & Franchise, Supply Chain, Technology & AI, Capital & Investment, Legal & Policy, and Next-Generation Restaurateurs & Entrepreneurship.</p>
<h2>4. Advisory Committee</h2>
<p>Chief Advisor, Distinguished Advisors, Honorary Advisors; plus an Honorary President. Advisors do not participate in governance or daily management and hold no vote.</p>
<h2>5. Local Chapters and Alliances</h2>
<p>Chapters in New York, California, Texas, Florida, New Jersey, Illinois, Washington State, Boston, Las Vegas, Hawaii, and overseas partners. Industry alliances are formed or joined by the Association, have no independent legal status, and follow operating rules set separately by the Board.</p>
<p class="text-sm text-ink-600">See Chapters 3–11 of the "Bylaws" page for the full text.</p>
$en$, 'published', now(), 7);

-- ---------- 13. Association Services 页面 ----------
insert into public.pages (slug, "group", title_zh, title_en, body_zh, body_en, status, published_at, sort_order) values
('business-development', 'services', '商业发展', 'Business Development', '<p>协助会员企业制定市场拓展策略，对接跨区域商业合作机会，提升经营能力与抗风险能力。</p>', '<p>Helping member companies develop market expansion strategies, connect with cross-regional business opportunities, and strengthen operations and resilience.</p>', 'published', now(), 1),
('brand-franchise', 'services', '品牌与连锁', 'Brand & Franchise', '<p>为会员企业提供品牌建设与连锁化拓展支持，协助优质品牌从本地走向全美及国际市场。</p>', '<p>Supporting brand building and franchise expansion, helping quality brands grow from local to national and international markets.</p>', 'published', now(), 2),
('supply-chain-resources', 'services', '供应链资源', 'Supply Chain Resources', '<p>连接食材、餐饮设备与冷链物流资源，帮助会员企业优化采购成本与配送效率。</p>', '<p>Connecting food supply, restaurant equipment and cold chain logistics resources to help member companies optimize procurement costs and delivery efficiency.</p>', 'published', now(), 3),
('technology-ai', 'services', '科技与AI', 'Technology & AI', '<p>推动人工智能在点餐、厨房管理、营销与数据分析中的应用，助力会员企业数字化转型。</p>', '<p>Advancing AI applications in ordering, kitchen management, marketing and data analytics to support digital transformation.</p>', 'published', now(), 4),
('capital-investment', 'services', '资本与投资', 'Capital & Investment', '<p>连接优质餐饮企业与投资、融资和资本市场资源，助力企业稳健成长。</p>', '<p>Connecting quality restaurant companies with investment, financing and capital market resources to support sustainable growth.</p>', 'published', now(), 5),
('legal-policy-support', 'services', '法律与政策支持', 'Legal & Policy Support', '<p>提供法律法规与政策动态参考，协助会员企业提升合规水平、反馈行业诉求。</p>', '<p>Providing legal and policy references to help member companies strengthen compliance and voice industry concerns.</p>', 'published', now(), 6),
('training-talent', 'services', '培训与人才发展', 'Training & Talent', '<p>组织餐饮管理、创新与创业相关培训，培养行业管理人才与新生代创业者。</p>', '<p>Organizing training in restaurant management, innovation and entrepreneurship to cultivate industry talent and next-generation entrepreneurs.</p>', 'published', now(), 7),
('international-cooperation', 'services', '国际合作', 'International Cooperation', '<p>推动与海外餐饮行业机构的合作交流，助力会员企业拓展国际市场。</p>', '<p>Advancing cooperation and exchange with overseas restaurant industry organizations to help members expand into international markets.</p>', 'published', now(), 8),
('media-promotion', 'services', '媒体与品牌推广', 'Media & Brand Promotion', '<p>通过协会媒体资源与合作渠道，帮助会员企业提升品牌曝光与行业影响力。</p>', '<p>Leveraging ARDA''s media resources and partner channels to help member companies increase brand visibility and industry influence.</p>', 'published', now(), 9);

-- ---------- 14. Legal 法律页面 ----------
insert into public.pages (slug, "group", title_zh, title_en, body_zh, body_en, status, published_at, sort_order) values
('privacy-policy', 'legal', '隐私政策', 'Privacy Policy', $zh$
<p>美国餐饮业发展协会（ARDA）尊重并保护您的个人信息。本隐私政策说明协会如何收集、使用、存储和保护您通过本网站提供的信息。</p>
<h2>我们收集的信息</h2>
<p>包括您通过会员申请表、联系表单、活动报名表及新闻通讯订阅提供的姓名、联系方式、公司信息等。</p>
<h2>信息使用方式</h2>
<p>用于处理会员申请、活动报名、回复咨询、发送协会通讯，以及协会内部统计分析。未经您同意，协会不会将您的个人信息用于上述目的以外的用途，也不会向无关第三方出售或出租。</p>
<h2>信息保护</h2>
<p>协会通过身份认证、权限控制、数据库安全策略等技术与管理措施保护您的信息安全。会员的电话、邮箱、地址等敏感信息默认不对外公开。</p>
<h2>您的权利</h2>
<p>您可以随时通过"联系我们"页面要求查询、更正或删除您的个人信息。</p>
$zh$, $en$
<p>The American Restaurant Development Association (ARDA) respects and protects your personal information. This Privacy Policy explains how we collect, use, store and protect information you provide through this website.</p>
<h2>Information We Collect</h2>
<p>This includes your name, contact details and company information submitted through membership applications, contact forms, event registrations and newsletter sign-ups.</p>
<h2>How We Use Your Information</h2>
<p>We use it to process membership applications and event registrations, respond to inquiries, send Association communications, and for internal statistics. We do not use your personal information for purposes beyond these without your consent, nor do we sell or rent it to unrelated third parties.</p>
<h2>Protecting Your Information</h2>
<p>ARDA protects your information through authentication, access control and database security measures. Members' phone numbers, email addresses and other sensitive details are not publicly disclosed by default.</p>
<h2>Your Rights</h2>
<p>You may request to access, correct or delete your personal information at any time via the Contact Us page.</p>
$en$, 'published', now(), 1),

('terms-of-use', 'legal', '使用条款', 'Terms of Use', $zh$
<p>欢迎访问美国餐饮业发展协会（ARDA）官方网站。使用本网站即表示您同意以下条款。</p>
<h2>网站内容</h2>
<p>本网站内容仅供参考，协会努力确保信息准确，但不对内容的完整性或时效性作出保证。</p>
<h2>知识产权</h2>
<p>本网站的文字、图片、标识等内容归美国餐饮业发展协会或相应版权方所有，未经许可不得擅自转载或商业使用。</p>
<h2>用户行为</h2>
<p>您同意不将本网站用于任何非法用途，不得干扰网站正常运行或尝试未经授权访问后台系统。</p>
$zh$, $en$
<p>Welcome to the official website of the American Restaurant Development Association (ARDA). By using this website, you agree to the following terms.</p>
<h2>Website Content</h2>
<p>Content on this site is provided for reference only. While ARDA strives for accuracy, we do not guarantee the completeness or timeliness of all content.</p>
<h2>Intellectual Property</h2>
<p>Text, images, logos and other content on this site belong to ARDA or the respective rights holders and may not be reproduced or used commercially without permission.</p>
<h2>Acceptable Use</h2>
<p>You agree not to use this website for unlawful purposes, disrupt its normal operation, or attempt unauthorized access to the administrative system.</p>
$en$, 'published', now(), 2),

('cookie-policy', 'legal', 'Cookie 政策', 'Cookie Policy', $zh$
<p>本网站使用必要的 Cookie 以保存您的语言偏好等设置，提升您的浏览体验。协会不使用 Cookie 追踪您在其他网站上的行为，也不会将 Cookie 数据出售给第三方。</p>
$zh$, $en$
<p>This website uses essential cookies to remember settings such as your language preference and improve your browsing experience. ARDA does not use cookies to track your activity on other websites, nor does it sell cookie data to third parties.</p>
$en$, 'published', now(), 3),

('accessibility-statement', 'legal', '无障碍声明', 'Accessibility Statement', $zh$
<p>美国餐饮业发展协会致力于让本网站符合 WCAG 无障碍标准的基本要求，包括合理的色彩对比度、键盘可访问性、图片替代文字与表单标签关联等。如果您在访问本网站时遇到无障碍方面的困难，请通过"联系我们"页面告知我们，协会将尽力改进。</p>
$zh$, $en$
<p>ARDA is committed to meeting the fundamental requirements of WCAG accessibility standards for this website, including reasonable color contrast, keyboard accessibility, image alternative text, and properly associated form labels. If you encounter accessibility difficulties on this site, please let us know via the Contact Us page and we will work to address them.</p>
$en$, 'published', now(), 4),

('conflict-of-interest', 'legal', '利益冲突政策', 'Conflict of Interest Policy', $zh$
<p>协会董事局、执行理事会、监事会及各专业委员会成员在参与涉及自身或关联方利益的事项决策时，应主动披露相关利益关系并回避表决，以维护协会决策的公正性与公信力。具体实施细则见协会章程。</p>
$zh$, $en$
<p>Members of the Board of Directors, Executive Council, Supervisory Board and professional committees must proactively disclose any personal or related-party interest in matters under discussion and recuse themselves from voting, to safeguard the fairness and integrity of ARDA's decision-making. Detailed procedures are set out in the Bylaws.</p>
$en$, 'published', now(), 5),

('financial-transparency', 'legal', '财务透明度', 'Financial Transparency', $zh$
<p>美国餐饮业发展协会致力于保持财务运作的透明与规范。协会的收入与支出、捐赠使用情况等财务信息将由监事会监督，并按章程规定的周期向会员大会报告。相关财务报告文件将适时发布于"资源中心"。</p>
$zh$, $en$
<p>ARDA is committed to transparent and disciplined financial management. Income, expenditures and the use of donations are overseen by the Supervisory Board and reported to the General Assembly on the schedule set out in the Bylaws. Relevant financial reports will be published in the Resources Center as they become available.</p>
$en$, 'published', now(), 6),

('disclaimer', 'legal', '网站免责声明', 'Website Disclaimer', $zh$
<p>本网站提供的信息仅供一般参考之用，不构成法律、财务或商业建议。协会不对因使用本网站信息而产生的任何直接或间接损失承担责任。本网站可能包含指向第三方网站的链接，协会不对第三方网站的内容负责。</p>
$zh$, $en$
<p>Information on this website is provided for general reference only and does not constitute legal, financial or business advice. ARDA is not liable for any direct or indirect loss arising from the use of information on this site. This website may contain links to third-party sites, and ARDA is not responsible for their content.</p>
$en$, 'published', now(), 7);

-- ---------- 14b. 分会与全球网络 子页面（group=custom） ----------
insert into public.pages (slug, "group", title_zh, title_en, body_zh, body_en, status, published_at, sort_order) values
('chapters-alliances', 'custom', '行业联盟', 'Industry Alliances', $zh$
<p>协会积极与餐饮行业相关的商会、协会及联盟建立合作关系，共同推动行业标准建设与资源共享。相关合作联盟信息将持续更新。</p>
$zh$, $en$
<p>ARDA actively builds relationships with chambers of commerce, associations and alliances related to the restaurant industry to jointly advance industry standards and resource sharing. Details on partner alliances will be updated here.</p>
$en$, 'published', now(), 1),
('chapters-international-partners', 'custom', '国际合作伙伴', 'International Partners', $zh$
<p>协会致力于与海外餐饮行业机构建立合作关系，推动国际交流与合作。以下为协会的海外合作机构网络。</p>
$zh$, $en$
<p>ARDA is committed to building relationships with overseas restaurant industry organizations to advance international exchange and cooperation. Below is ARDA's overseas partner network.</p>
$en$, 'published', now(), 2),
('chapters-global-network', 'custom', '全球网络', 'Global Network', $zh$
<p>协会正在构建覆盖全美主要州市及海外重点地区的分会与合作网络，第一阶段立足华人餐饮社区，逐步扩展至更广泛的亚裔餐饮产业与国际市场。</p>
$zh$, $en$
<p>ARDA is building a chapter and partnership network spanning major U.S. states and cities as well as key overseas regions — starting with the Chinese restaurant community and expanding to the broader Asian-American restaurant industry and international markets.</p>
$en$, 'published', now(), 3);

-- ---------- 15. 示例新闻（占位内容，可在后台编辑/替换/新增） ----------
insert into public.news_posts (slug, category_id, title_zh, title_en, excerpt_zh, excerpt_en, body_zh, body_en, is_pinned, status, published_at, author) values
('arda-website-launch',
 (select id from public.news_categories where slug = 'association-news'),
 '美国餐饮业发展协会官方网站正式上线', 'ARDA Official Website Now Live',
 '美国餐饮业发展协会官方网站正式上线，欢迎全美餐饮从业者了解协会、申请入会。',
 'The official website of the American Restaurant Development Association is now live. Restaurant professionals nationwide are welcome to learn more and apply for membership.',
 '<p>美国餐饮业发展协会官方网站正式上线，网站涵盖协会介绍、新闻活动、专业委员会、地方分会、会员申请等完整内容体系，欢迎全美餐饮从业者访问了解。</p>',
 '<p>The official ARDA website is now live, covering the Association''s introduction, news and events, professional committees, local chapters, membership applications and more. Restaurant professionals nationwide are welcome to explore the site.</p>',
 true, 'published', now(), '协会秘书处 / ARDA Secretariat'),
('committees-established',
 (select id from public.news_categories where slug = 'association-news'),
 '协会六大专业委员会正式成立', 'ARDA Establishes Six Professional Committees',
 '协会正式成立品牌连锁、供应链、科技与AI、资本投资、法律政策、新生代创业六大专业委员会。',
 'ARDA has formally established six professional committees: Branding & Franchise, Supply Chain, Technology & AI, Capital & Investment, Legal & Policy, and Next-Generation Entrepreneurship.',
 '<p>为更好地服务会员企业，协会正式成立六大专业委员会，覆盖品牌连锁、供应链、科技与AI、资本投资、法律政策及新生代创业等领域，欢迎会员积极参与。</p>',
 '<p>To better serve member companies, ARDA has formally established six professional committees covering branding and franchise, supply chain, technology and AI, capital and investment, legal and policy, and next-generation entrepreneurship. Members are encouraged to participate.</p>',
 false, 'published', now(), '协会秘书处 / ARDA Secretariat');

-- ---------- 16. 示例活动（占位内容） ----------
insert into public.events (slug, category, title_zh, title_en, summary_zh, summary_en, body_zh, body_en, start_at, timezone, location_zh, location_en, host_zh, host_en, event_status, status, published_at, is_featured) values
('inaugural-industry-forum', 'forum', '协会成立行业论坛', 'ARDA Inaugural Industry Forum',
 '协会成立行业论坛，聚焦餐饮行业发展趋势与协作机遇。',
 'ARDA''s inaugural industry forum, focused on restaurant industry trends and collaboration opportunities.',
 '<p>具体议程与嘉宾名单将于近期公布，敬请关注协会新闻与活动页面更新。</p>',
 '<p>The detailed agenda and speaker lineup will be announced soon. Please check the News and Events pages for updates.</p>',
 (now() + interval '45 days'), 'America/New_York', '纽约（具体地点待定）', 'New York, NY (venue to be announced)',
 '美国餐饮业发展协会', 'American Restaurant Development Association',
 'upcoming', 'published', now(), true);

-- ---------- 17. 示例合作伙伴（草稿状态，仅供后台演示，不会在前台公开展示） ----------
insert into public.partners (category, name_zh, name_en, description_zh, description_en, sort_order, status) values
('strategic', '示例战略合作伙伴', 'Sample Strategic Partner', '此为后台功能演示用占位数据，请替换为真实合作伙伴信息后发布。', 'This is placeholder data for admin demonstration purposes. Replace with real partner information before publishing.', 1, 'draft');

-- ============================================================
-- 关于创建第一个后台管理员账号：
-- Supabase Auth 用户必须先通过 Supabase Dashboard 或 Auth API 创建
-- （auth.users 由 Supabase 管理，无法在本 seed.sql 中直接插入）。
-- 创建用户后，执行以下语句将其关联为 super_admin（将 <NEW_USER_UUID> 和邮箱替换为实际值）：
--
-- insert into public.admin_users (id, email, full_name, role_id, is_active)
-- values (
--   '<NEW_USER_UUID>',
--   'admin@ardaus.org',
--   '系统管理员',
--   (select id from public.roles where key = 'super_admin'),
--   true
-- );
--
-- 详细步骤见项目根目录 README.md「创建第一个管理员」章节。
-- ============================================================

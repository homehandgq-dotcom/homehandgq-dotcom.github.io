import { getSiteSetting, type MissionItem } from "@/lib/data/siteSettings";

/**
 * 首页新增三块板块的数据（站点设置键：home_benefits / home_empower / home_community）。
 * 内容来自协会发展提案与模拟站定稿，后台「站点设置」里改这三个键即可改前台文字，
 * 不用再改代码；数据库里还没有这三个键时，用下面内置的定稿文案兜底显示。
 * 上线时执行 supabase/patches/2026-11-18_homepage_sections.sql 即可把三键写入数据库。
 */

export interface CultureSample {
  name_zh: string;
  name_en: string;
  url: string;
  note_zh: string;
  note_en: string;
}

export interface BenefitsData {
  intro_zh: string;
  intro_en: string;
  items: MissionItem[];
  culture_title_zh: string;
  culture_title_en: string;
  culture_paragraphs_zh: string[];
  culture_paragraphs_en: string[];
  culture_samples: CultureSample[];
}

const FALLBACK_BENEFITS: BenefitsData = {
  intro_zh: "加入进来，能拿到什么，比协会要做什么更重要。落在会员店里的，是这八样。",
  intro_en:
    "What members actually receive matters more than what the Association plans to do. For a member restaurant, it comes down to these eight things.",
  items: [
    {
      title_zh: "先看懂智能化时代",
      title_en: "Understand the AI Era First",
      desc_zh:
        "客人找店、点餐、评价的方式都在变，先在协会里把智能化时代和美国客人的消费文化看明白；再把已经跑通的 AI 语音点餐和 AI 营销在会员店试点用起来，忙时不漏单，广告和评价有人管，省下的是真人手。协会帮会员把 POS、支付、线上订餐、外卖这些工具的成本和合同条款比清楚，少花冤枉钱、少踩坑。",
      desc_en:
        "How guests find a restaurant, order and leave reviews is all changing. Members first get a clear picture of the AI era and U.S. consumer culture, then pilot proven AI voice ordering and AI marketing in their own stores — no missed orders at peak hours, ads and reviews looked after, real staff hours saved. ARDA also helps members compare the costs and contract terms of POS, payments, online ordering and delivery tools, so they spend less and avoid the common traps.",
    },
    {
      title_zh: "产业链一张桌子对接",
      title_en: "The Whole Supply Chain at One Table",
      desc_zh:
        "食材、设备、冷链物流、配套服务在协会里直接见面谈，采购和合作不用自己一家家找。协会先统计会员的采购需求，食材、冻品、海鲜、包装、设备、清洁用品一起谈团购价格和专属折扣，帮会员把采购成本降下来；比价标准公开，不强制采购。",
      desc_en:
        "Ingredients, equipment, cold-chain logistics and support services meet face to face inside the Association — no more hunting supplier by supplier. ARDA pools members' purchasing needs across ingredients, frozen goods, seafood, packaging, equipment and cleaning supplies to negotiate group prices and member discounts, bringing purchasing costs down. Comparison standards are open, and no one is required to buy.",
    },
    {
      title_zh: "资金的事有人帮",
      title_en: "Help with Financing",
      desc_zh:
        "常见融资问题先讲明白，对接名单现成，预付餐饮额度、流水信用这些模式有路可走（介绍见上方「赋能餐饮实体」）。",
      desc_en:
        "Common financing questions are explained up front and a referral list is ready. Models such as prepaid dining credit and cash-flow-based credit give members a real path forward (see “Empowering Restaurants” above).",
    },
    {
      title_zh: "品牌被更多人看见",
      title_en: "Brands Seen by More People",
      desc_zh:
        "每月的饭局承办店就是当月展示位，活动照片在协会网站活动区展示；媒体营销方面，探店内容、媒体报道与渠道推广由协会牵线搭台，菜与人的故事有渠道讲出去。协会持续做《会员企业故事》《餐饮领袖访谈》《本月品牌案例》三个栏目，展示会员企业的经营经验。",
      desc_en:
        "The member restaurant hosting each monthly dinner is that month's showcase, with event photos displayed in the events area of the Association's website. For media and marketing, ARDA connects members with store-visit features, press coverage and channel promotion, so the stories behind the food and the people reach an audience. Three ongoing features — Member Company Stories, Restaurant Leader Interviews and Brand Case of the Month — present members' operating experience.",
    },
    {
      title_zh: "一个能常来往的圈子",
      title_en: "A Circle People Actually Show Up To",
      desc_zh:
        "半月一次羽毛球友会、每月饭局，同行老板和上下游常来常往，人先熟了，合作和生意顺带就谈出来了。除了羽毛球友会和饭局，还有十几人的小规模闭门圆桌，一次只聊一个经营问题，聊完有记录、有后续引荐。",
      desc_en:
        "A badminton meetup every two weeks and a dinner every month keep owners and supply-chain partners in regular contact — people get familiar first, and cooperation and business follow naturally. Alongside the meetups and dinners, small closed-door roundtables of a dozen or so people take up one operating question at a time, with notes kept and follow-up introductions made.",
    },
    {
      title_zh: "缺什么，在协会里补什么",
      title_en: "Whatever Is Missing, Found Here",
      desc_zh:
        "品牌、供应链、科技、资本、媒体、社区这些资源整合在一处，缺哪样对接哪样，不用再满世界跑。每家会员填两张表——我能提供什么、我需要什么，办公室分类匹配；引荐要经双方同意，之后还跟进、回访、记录成果。律师、会计师、保险这些专业人士，协会里有现成名录可对接。",
      desc_en:
        "Brand, supply chain, technology, capital, media and community resources are gathered in one place — whatever a member lacks can be matched here, without running all over town. Each member fills in two forms, what I can offer and what I need, and the office sorts and matches them. Introductions are made only with both sides' consent, then followed up and recorded. Lawyers, accountants and insurance professionals are available through a ready directory.",
    },
    {
      title_zh: "有一手店铺资源",
      title_en: "First-Hand Store Opportunities",
      desc_zh:
        "开店、扩店、转让的消息先在协会里流通：有店要转、有人找铺、有人找合伙，先问协会，多一手信息，少过一道手。成熟品牌想扩店、跨州开店，协会帮着做选址评估、对接当地资源，从单店往连锁和区域化走。",
      desc_en:
        "News about openings, expansions and transfers circulates inside the Association first: a store for sale, someone looking for a space, someone looking for a partner — ask ARDA first and get the information first-hand. For established brands expanding into new states, ARDA helps with site evaluation and local resources, on the path from a single store to a regional chain.",
    },
    {
      title_zh: "文化破圈，帮你引来更多老外客户",
      title_en: "Breaking the Cultural Barrier to Reach Mainstream Guests",
      desc_zh:
        "华人餐馆有个绕不开的痛点：菜做得不差，却和主流文化衔接不上——不懂老外客人怎么想、怎么选店，进不了老外的圈子，也用不上老外的资源，生意大多只在华人圈里转。这一步，叫文化破圈。协会帮会员店在文化上和老外接上头：一边把 inKind 这类平台、基金会与主流餐饮圈的资源引进来，注入会员单位；一边帮店里把中餐的故事用老外听得懂的方式讲出来，把英文菜单、英文点评平台门面、店面呈现这些衔接功夫做足。文化上接通了，老外客户才愿意走进来，老外资源才真正用得上。具体做法见下方「文化破圈，具体怎么做」。",
      desc_en:
        "Chinese restaurants face one stubborn problem: the food is good, but it does not connect with mainstream culture. Owners may not know how non-Chinese guests think or choose a restaurant, cannot get into their circles or use their resources, and business stays mostly within the Chinese community. Bridging that gap is what we call cultural breakthrough. ARDA helps member restaurants connect culturally: bringing in platforms such as inKind, foundations and mainstream dining-circle resources, while helping each store tell its Chinese food story in a way mainstream guests understand — English menus, English review-platform storefronts and in-store presentation done properly. Once the cultural connection is made, mainstream guests walk in and mainstream resources become usable. See “How Cultural Breakthrough Works” below for the method.",
    },
  ],
  culture_title_zh: "文化破圈，具体怎么做",
  culture_title_en: "How Cultural Breakthrough Works",
  culture_paragraphs_zh: [
    "动手之前，先把底层看懂：真正了解美国主流文化的发展模式。破圈不能只停在「老外爱吃什么」这一层。得先看懂：一个潮流在美国是怎么起来的、又是怎么传开的；媒体报道、点评平台和社交平台上的内容，怎么一步步影响客人最后选哪家店；一个品牌的故事和一场社区活动，又是怎么把原本不相干的人聚到一起、慢慢变成回头客的。把这套模式看明白了，才知道店该往哪里接、怎么接。下面的三步，都是从这里往下走的。",
    "破圈不是把店改成西餐厅，更不是丢掉中餐的本味，而是把中间那层文化隔膜拆掉：让老外客人看得懂、愿意进、坐得住，还愿意带朋友再来。协会陪会员店走三步。",
    "一、讲得懂。菜名、菜单和店里的故事，换成老外熟悉的说法来讲：一道菜是什么风味、该怎么吃、背后有什么讲究，用英文讲清楚、讲得有意思；英文点评平台上的门面同步立起来，老外搜得到、看得懂，才谈得上下一步。",
    "二、进得去。协会把会员店带进主流的场子：inKind 这类平台带来的主流食客、基金会与社区的活动、主流餐饮圈的评选与媒体曝光，先让店在老外的视野里出现，再谈人家愿不愿意来。",
    "三、处得来。羽毛球友会、饭局这类协会活动，也可以请老外朋友与合作伙伴一起来——先一起打球、一起吃饭，关系处起来了，文化隔膜在来往里慢慢化开，后面的合作和生意才接得上。",
    "三步走完，会员店拿到的不只是一批新客人，还有主流圈子的渠道、活动与合作机会。这就是协会愿景「助力华餐发展成为主流」落到一家店上的样子：先在文化上破圈，再让生意出圈。",
    "网上先接上，老外资本也一起引。破圈要引的不只是老外客户，还有老外资本，而衔接的主战场，就是老外日常用的社交平台。协会帮会员店在主流社交平台上把英文内容做起来——探店短视频、活动动态、店里的故事，持续发、好好讲，让更多老外客户先在网上看见中餐、看见中餐的力量；老外资本也一样，得先在这些平台上看见中餐的热度和增长，才谈得上把资本引进来。线下处得来，线上看得见，客户和资本，一起引进来。说到底，文化破圈就一件事——让中餐赚老外的钱。客户进店吃饭是钱，资本看进来也是钱，前面讲的衔接、平台、资源，最后都落到这一句上。",
  ],
  culture_paragraphs_en: [
    "Before acting, understand the ground layer: how American mainstream culture actually develops and spreads. Breaking through is not just about “what non-Chinese guests like to eat.” It means seeing how a trend starts and travels in the U.S., how media coverage, review platforms and social content step by step decide which restaurant a guest finally picks, and how a brand story or a community event gathers strangers together and slowly turns them into regulars. Once that pattern is clear, a store knows where and how to connect. The three steps below all start from there.",
    "A breakthrough does not mean turning the store into a Western restaurant or giving up the true flavor of Chinese food. It means removing the cultural film in between, so mainstream guests can understand the store, want to come in, feel comfortable staying, and bring friends back. ARDA walks member stores through three steps.",
    "Step one: be understood. Dish names, menus and the store's story are told the way mainstream guests are used to hearing them — what a dish tastes like, how to eat it, and the story behind it, explained clearly and interestingly in English. The storefront on English review platforms is built at the same time, so guests can find and understand the store before anything else.",
    "Step two: get in. ARDA brings member stores into mainstream settings — diners arriving through platforms such as inKind, foundation and community events, mainstream dining awards and media exposure — so the store first appears in mainstream guests' view.",
    "Step three: get along. Association activities such as the badminton meetup and the monthly dinner can include non-Chinese friends and partners: play a game together, share a meal together, and as relationships form, the cultural distance quietly closes and cooperation follows.",
    "After the three steps, a member store gains not just a new group of guests, but mainstream channels, events and partnership opportunities. This is the Association's vision — helping Chinese cuisine become mainstream — landing in a single store: break through culturally first, then let the business break out.",
    "Connect online as well, and bring in mainstream capital together with guests. What a breakthrough draws in is not only guests but also capital, and the main arena is the social platforms mainstream audiences use every day. ARDA helps member stores build English content on those platforms — store-visit short videos, event updates and the store's own story, posted consistently and told well — so more mainstream guests first see Chinese food, and its momentum, online. Capital works the same way: investors need to see the heat and growth of Chinese cuisine on those platforms before capital can be brought in. Getting along offline and being seen online brings guests and capital in together. In the end, cultural breakthrough comes down to one thing: letting Chinese food earn mainstream money. Guests dining in is money; capital coming in is money. The connection, the platforms and the resources all land on that one line.",
  ],
  culture_samples: [
    { name_zh: "鼎泰丰 Din Tai Fung", name_en: "Din Tai Fung", url: "https://dtf.com/en/locations/new-york", note_zh: "把中餐做成全球主流品牌", note_en: "Chinese cuisine built into a global mainstream brand" },
    { name_zh: "China Live", name_en: "China Live", url: "https://chinalivesf.com/", note_zh: "把唐人街中餐做成主流食客愿意走进去的文化空间", note_en: "Chinatown dining turned into a cultural space mainstream diners walk into" },
    { name_zh: "Mister Jiu's", name_en: "Mister Jiu's", url: "https://www.misterjius.com/", note_zh: "旧金山唐人街米其林，把粤菜做成主流追捧的样子", note_en: "A Michelin-starred Chinatown restaurant that made Cantonese food a mainstream pursuit" },
    { name_zh: "海底捞 Haidilao", name_en: "Haidilao", url: "https://www.haidilao.com/", note_zh: "靠服务和体验把火锅开进全美主流商场", note_en: "Hot pot brought into mainstream U.S. malls through service and experience" },
    { name_zh: "添好运 Tim Ho Wan", name_en: "Tim Ho Wan", url: "https://timhowanusa.com/", note_zh: "米其林点心开成全球连锁", note_en: "Michelin dim sum grown into a global chain" },
    { name_zh: "Hakkasan", name_en: "Hakkasan", url: "https://hakkasan.com/las-vegas/", note_zh: "把粤菜做成全球高端品牌", note_en: "Cantonese cuisine built into a global high-end brand" },
    { name_zh: "西安名吃 Xi'an Famous Foods", name_en: "Xi'an Famous Foods", url: "http://xianfoods.com/", note_zh: "法拉盛小档口做成纽约人排队的连锁", note_en: "A small Flushing stall grown into a New York chain people line up for" },
    { name_zh: "RedFarm", name_en: "RedFarm", url: "http://www.redfarmnyc.com/", note_zh: "把点心做成纽约主流食客追捧的创意中餐", note_en: "Dim sum reimagined as creative Chinese food sought after by mainstream New York diners" },
  ],
};

export async function getHomeBenefits(): Promise<BenefitsData> {
  return getSiteSetting("home_benefits", FALLBACK_BENEFITS);
}

export interface EmpowerCard {
  tag_zh: string;
  tag_en: string;
  title_zh: string;
  title_en: string;
  paragraphs_zh: string[];
  paragraphs_en: string[];
  bullets_zh: string[];
  bullets_en: string[];
  note_zh?: string;
  note_en?: string;
}

export interface EmpowerData {
  intro_zh: string;
  intro_en: string;
  cards: EmpowerCard[];
  academy_title_zh: string;
  academy_title_en: string;
  academy_paragraphs_zh: string[];
  academy_paragraphs_en: string[];
}

const FALLBACK_EMPOWER: EmpowerData = {
  intro_zh:
    "协会的服务最终要落到一家家店里。这一板块把三件具体的事讲清楚：资金怎么对接、智能化时代怎么先看懂再落到店里、成熟的门店做法怎么带进会员企业。",
  intro_en:
    "Association services ultimately have to land inside individual restaurants. This section spells out three concrete things: how financing is connected, how to understand the intelligent era before applying it in a store, and how proven store practices are brought into member companies.",
  cards: [
    {
      tag_zh: "金融赋能",
      tag_en: "Financing",
      title_zh: "资金的事，有具体的路",
      title_en: "Financing, with a Concrete Path",
      paragraphs_zh: [
        "餐饮店最常卡在周转和扩张的钱上。协会对接的金融支持，介绍两种已经在美国餐饮业跑起来的模式，供会员按自家情况了解与对接：",
      ],
      paragraphs_en: [
        "Restaurants most often get stuck on cash flow and expansion money. The financing support ARDA connects members with introduces two models already working in the U.S. restaurant industry, for members to review and pursue according to their own situation:",
      ],
      bullets_zh: [
        "预付餐饮额度 — 金融机构按约定额度预先买下餐厅未来一段时间的餐饮消费额度，餐厅先拿到一笔资金用于经营与周转；食客之后凭额度到店消费，餐厅用实际营业慢慢抵回。",
        "流水信用 — 以门店真实的营业流水作为信用依据来评估额度，生意做得稳、流水清楚的店，不必只靠抵押物，也有机会对接到相应的资金支持。",
      ],
      bullets_en: [
        "Prepaid dining credit — a financial institution prepurchases an agreed amount of the restaurant's future dining credit, so the restaurant receives funds up front for operations and cash flow; guests later spend the credit in store, and the restaurant offsets it gradually through actual business.",
        "Cash-flow credit — the store's real operating revenue is used as the basis for evaluating a credit line, so a steadily run store with clear revenue records can access financing without relying only on collateral.",
      ],
      note_zh: "具体额度、条件与对接机构以实际洽谈为准，会员可通过协会秘书处了解对接名单与流程。",
      note_en:
        "Specific amounts, terms and institutions are subject to actual discussion. Members can ask the Secretariat for the referral list and process.",
    },
    {
      tag_zh: "AI 赋能",
      tag_en: "AI",
      title_zh: "先看懂智能化时代，再谈工具",
      title_en: "Understand the Intelligent Era Before the Tools",
      paragraphs_zh: [
        "餐饮正在进入智能化时代，先变的不是店里的设备，而是客人的习惯：找店先在手机上搜、先看评分；点餐越来越多走电话、线上和语音；评价写在公开平台上，直接决定下一批客人来不来。做美国市场，先要理解美国客人这套消费文化——他们怎么找店、怎么下单、怎么评价、怎么复购，店里的许多老做法，就是从这里开始跟不上的。",
        "看懂了这个变化，再落工具才有方向。协会科技与 AI 委员会负责人温林鑫创办的 Chowbus，已上线 AI 语音点餐与 AI 营销，是顺着这套消费习惯做出来的、已经在实际运行的产品：",
      ],
      paragraphs_en: [
        "Dining is entering an intelligent era, and what changes first is not the equipment in the store but the habits of guests: they search on their phones and check ratings before choosing a store; ordering increasingly happens by phone, online and voice; reviews are written on public platforms and directly decide whether the next guests come. To work in the U.S. market, a store first has to understand this consumer culture — how guests find a store, place an order, leave a review and come back. Many old in-store practices start falling behind right there.",
        "Once that change is understood, tools have a direction. Chowbus, founded by Linxin Wen, who leads ARDA's Technology & AI Committee, has launched AI voice ordering and AI marketing — products built around exactly these consumer habits and already running in real stores:",
      ],
      bullets_zh: [
        "AI 语音点餐 — 对应客人电话与语音下单的习惯：订单由 AI 接听处理，忙时不漏单，前台人手省下来照顾堂食客人。",
        "AI 营销 — 对应客人先搜、先看评价的习惯：广告投放、评价管理等日常营销动作由工具辅助完成，店主不用再样样自己盯。",
        "先试点，再推广 — 先在会员企业试点使用，跑顺了、有效果了，再向更多会员店开放对接。",
      ],
      bullets_en: [
        "AI voice ordering — matching guests' phone and voice ordering habits: orders are answered and handled by AI, no orders are missed at peak hours, and front-of-house staff are freed to look after dine-in guests.",
        "AI marketing — matching guests' habit of searching and reading reviews first: everyday marketing work such as ad placement and review management is handled with tool support, so owners no longer have to watch everything themselves.",
        "Pilot first, then expand — tools are piloted in member companies first, and only opened to more member stores once they run smoothly and show results.",
      ],
    },
    {
      tag_zh: "门店模式",
      tag_en: "Store Model",
      title_zh: "把主流餐饮的铺面做法带进来",
      title_en: "Bringing Mainstream Store Practices In",
      paragraphs_zh: [
        "开店的许多问题，主流餐饮连锁已经有成熟的解法。协会把这些铺面做法整理出来，带进会员企业的日常经营：",
      ],
      paragraphs_en: [
        "Many problems in running a store already have proven answers in mainstream restaurant chains. ARDA organises those store practices and brings them into members' daily operations:",
      ],
      bullets_zh: [
        "选址与铺面 — 商圈判断、铺面条件与租约要点，按成熟连锁的评估方法逐项过。",
        "店内运营 — 动线、排班、出餐与服务流程，参照主流门店的标准做法调整。",
        "菜单与呈现 — 菜单结构、英文菜单与门店呈现方式，逐步向主流食客的习惯靠拢。",
      ],
      bullets_en: [
        "Site and premises — trade-area judgement, premises conditions and lease points, reviewed item by item using established chains' evaluation methods.",
        "In-store operations — layout flow, scheduling, food delivery and service processes, adjusted against mainstream stores' standard practices.",
        "Menu and presentation — menu structure, English menus and in-store presentation, gradually aligned with mainstream diners' habits.",
      ],
      note_zh: "做法带进来不是照搬，每家店按自己的品类与客群取用，协会组织参访与交流时同步分享实际案例。",
      note_en:
        "These practices are not copied blindly — each store takes what fits its category and clientele, and ARDA shares real cases during organised visits and exchanges.",
    },
  ],
  academy_title_zh: "育才对接：把老板和店长送去上纽约餐饮学院的免费课",
  academy_title_en: "Talent Connection: Sending Owners and Managers to the NYC Restaurant Academy's Free Courses",
  academy_paragraphs_zh: [
    "店要做稳，管店的人得先补上经营这一课。纽约现成有一套官方资源可以用——纽约餐饮学院（NYC Restaurant Academy），是纽约市小企业服务局（NYC Department of Small Business Services，简称 NYC SBS）办的免费餐饮经营课程，讲的正是开店管店最实用的三块：经营、财务、合规。",
    "协会做的是对接这件事：把课程信息、开课安排和报名方式整理清楚，帮会员店的老板和店长对上去、报上名、去上课，用上这套现成的官方培训资源，少走弯路。这门课不是协会自办的，协会也不是签约合作伙伴——价值在于协会替会员把路探好、把人送到课上，回来就能用在自家店里。这也是协会使命里「育才储能」落到一家店上的具体做法：人才不用从零自己培养，先把纽约市已经备好的免费课用足。",
  ],
  academy_paragraphs_en: [
    "For a store to run steadily, the people managing it first need the business lesson. New York already has an official resource ready to use — the NYC Restaurant Academy, a free restaurant business programme run by the NYC Department of Small Business Services (NYC SBS), covering the three most practical parts of opening and running a store: operations, finance and compliance.",
    "What ARDA does is the connection: organising course information, schedules and enrolment, and helping member stores' owners and managers get matched, signed up and into class, so they use this ready official training resource and avoid detours. The course is not run by ARDA, and ARDA is not a contracted partner — the value is that the Association scouts the path and gets people into the classroom, and what they learn comes straight back into their own stores. This is the mission item “Talent Development” landing in a single store: talent does not have to be trained from zero when the City's free courses can be fully used first.",
  ],
};

export async function getHomeEmpower(): Promise<EmpowerData> {
  return getSiteSetting("home_empower", FALLBACK_EMPOWER);
}

export interface CommunityActivity {
  freq_zh: string;
  freq_en: string;
  title_zh: string;
  title_en: string;
  desc_zh: string;
  desc_en: string;
}

export interface CommunityData {
  intro_zh: string;
  intro_en: string;
  activities: CommunityActivity[];
  why_title_zh: string;
  why_title_en: string;
  why_paragraphs_zh: string[];
  why_paragraphs_en: string[];
  photo_note_zh: string;
  photo_note_en: string;
}

const FALLBACK_COMMUNITY: CommunityData = {
  intro_zh:
    "协会的活动先从好玩、好吃、能见面开始：羽毛球友会半月一次、从纽约先办起来，饭局在会员店里轮着办。活动不设高门槛，先把人聚出来，关系和生意都是在见面里慢慢长出来的。",
  intro_en:
    "Association activities start with what is fun, tasty and brings people together: a badminton meetup every two weeks, starting in New York, and dinners rotating through member restaurants. There is no high barrier to join — gather people first, and relationships and business grow out of meeting, slowly and naturally.",
  activities: [
    {
      freq_zh: "半月",
      freq_en: "2×/mo",
      title_zh: "半月一次羽毛球友会 · 纽约先行",
      title_en: "Badminton Meetup, Every Two Weeks · Starting in New York",
      desc_zh:
        "羽毛球友会半个月办一场，先由纽约开始，其他地区随后照着办。可以带身边的朋友一起来——先打球、再聚餐，熟了自然进圈子，人带人，把圈子慢慢滚大。",
      desc_en:
        "The badminton meetup runs every two weeks, starting in New York, with other areas following the same pattern. Friends are welcome — play first, eat together after, and as people get familiar they join the circle, person bringing person, growing it steadily.",
    },
    {
      freq_zh: "每月",
      freq_en: "Monthly",
      title_zh: "每月饭局 · 在会员店里轮流主办",
      title_en: "Monthly Dinner · Hosted in Turn by Member Restaurants",
      desc_zh:
        "每月一聚，由会员老板轮流在自己店里主办。大家上门吃饭、看店、聊近况；承办店就是当月的展示位，新菜、新店、新做法，饭桌上先让同行尝到、看到。",
      desc_en:
        "Once a month, member owners take turns hosting in their own restaurants. Everyone comes to eat, see the store and catch up; the host store is that month's showcase, where new dishes, new stores and new practices are first tasted and seen by peers at the table.",
    },
    {
      freq_zh: "闭门",
      freq_en: "Closed-door",
      title_zh: "闭门圆桌 · 一次只聊一个经营问题",
      title_en: "Closed-Door Roundtable · One Operating Question at a Time",
      desc_zh:
        "十几人的小规模闭门圆桌，一次只聊一个经营问题，聊完有记录、有后续引荐。人不多，话能说透，问题能落到具体的下一步。",
      desc_en:
        "A small closed-door roundtable of a dozen or so people takes up one operating question at a time, with notes kept and follow-up introductions made. With few people in the room, things can be said plainly and problems land on a concrete next step.",
    },
  ],
  why_title_zh: "为什么先办羽毛球友会和饭局",
  why_title_en: "Why Badminton and Dinners Come First",
  why_paragraphs_zh: [
    "信息只有在交流活动的碰撞中产生。餐馆老板平常各忙各的，基本都在做自己的事情，正经开会很难把人聚齐。只有运动，是大家自己愿意出来的事——出得来、常碰面，关系才保持得住。",
    "人出来了，信息就流动了：谁家换了供应商、哪条街客流在变、什么新做法有效，都是在羽毛球场边、饭桌上聊出来的。关系保持住，生意和链接是顺带的结果；每场活动的照片和动态发出来，本身也是协会和会员店的宣传。",
  ],
  why_paragraphs_en: [
    "Information only appears when people meet and talk. Restaurant owners are each busy with their own business, and a formal meeting rarely gathers everyone. Sport is the one thing people come out for willingly — show up, meet often, and relationships hold.",
    "Once people are out, information flows: who changed suppliers, which street's foot traffic is shifting, which new practice actually works — all of it comes out courtside and at the dinner table. With relationships kept up, business and connections follow as a by-product; and the photos and updates from each activity are themselves promotion for the Association and its member stores.",
  ],
  photo_note_zh:
    "每次活动都拍照留影，照片就放在协会网站的活动区展示。羽毛球友会的人、饭局的菜，一场场积下来，网站上自然有了持续更新的内容——新朋友点进来，看到的是一个一直在活动的协会；会员店也多了一个长期露面的位置。",
  photo_note_en:
    "Every activity is photographed, and the photos are displayed in the events area of the Association's website. The people at badminton and the dishes at dinner accumulate event by event, so the site naturally keeps fresh content — new visitors see an association that is always active, and member stores gain a lasting place to be seen.",
};

export async function getHomeCommunity(): Promise<CommunityData> {
  return getSiteSetting("home_community", FALLBACK_COMMUNITY);
}

-- ============================================================
-- ARDA 内容补丁：2026-08-24
-- 用途：把「关于我们」四个页面的正文内容、精简后的导航结构、
--      协会联系方式（邮箱统一为 info@ardaus.org、地址更新为法拉盛办公地址）
--      同步到【已经存在数据的】线上 Supabase 项目，不影响会员申请、
--      后台账号等其他数据。可以安全地重复执行（幂等）。
--
-- 使用方法：登录 Supabase 控制台 → 左侧 SQL Editor → 新建查询 →
--          粘贴本文件全部内容 → Run。执行完刷新网站前台即可看到更新。
-- ============================================================

begin;
insert into public.pages (slug, "group", title_zh, title_en, body_zh, body_en, status, published_at, sort_order)
values
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
$en$, 'published', now(), 1)
on conflict ("group", slug) do update set
  title_zh = excluded.title_zh,
  title_en = excluded.title_en,
  body_zh = excluded.body_zh,
  body_en = excluded.body_en,
  status = excluded.status,
  published_at = excluded.published_at,
  sort_order = excluded.sort_order,
  updated_at = now();

insert into public.pages (slug, "group", title_zh, title_en, body_zh, body_en, status, published_at, sort_order)
values
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
$en$, 'published', now(), 4)
on conflict ("group", slug) do update set
  title_zh = excluded.title_zh,
  title_en = excluded.title_en,
  body_zh = excluded.body_zh,
  body_en = excluded.body_en,
  status = excluded.status,
  published_at = excluded.published_at,
  sort_order = excluded.sort_order,
  updated_at = now();

insert into public.pages (slug, "group", title_zh, title_en, body_zh, body_en, status, published_at, sort_order)
values
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
$en$, 'published', now(), 5)
on conflict ("group", slug) do update set
  title_zh = excluded.title_zh,
  title_en = excluded.title_en,
  body_zh = excluded.body_zh,
  body_en = excluded.body_en,
  status = excluded.status,
  published_at = excluded.published_at,
  sort_order = excluded.sort_order,
  updated_at = now();

insert into public.pages (slug, "group", title_zh, title_en, body_zh, body_en, status, published_at, sort_order)
values
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
$en$, 'published', now(), 7)
on conflict ("group", slug) do update set
  title_zh = excluded.title_zh,
  title_en = excluded.title_en,
  body_zh = excluded.body_zh,
  body_en = excluded.body_en,
  status = excluded.status,
  published_at = excluded.published_at,
  sort_order = excluded.sort_order,
  updated_at = now();

-- ---------- 导航结构：精简为 7 大类主导航 + 10 项页脚导航 ----------
delete from public.navigation_items where menu in ('header','footer');

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

-- ---------- 联系方式：邮箱统一为 info@ardaus.org，地址更新为法拉盛办公地址 ----------
insert into public.site_settings (key, value_json, description) values
  ('contact_info', '{
     "address_zh":"美国纽约州法拉盛缅街（Main St）36-26 号 2X 室，邮编 11354","address_en":"36-26 Main St, Suite 2X, Flushing, NY 11354",
     "phone":"+1 (000) 000-0000","email":"info@ardaus.org",
     "office_hours_zh":"周一至周五 9:00–18:00（美东时间）","office_hours_en":"Mon–Fri, 9:00 AM–6:00 PM (Eastern Time)",
     "media_email":"info@ardaus.org","membership_email":"info@ardaus.org","business_email":"info@ardaus.org",
     "map_lat":40.762413,"map_lng":-73.831913,"social":[]
   }'::jsonb, '联系方式与社交链接')
on conflict (key) do update set
  value_json = excluded.value_json,
  description = excluded.description;

commit;

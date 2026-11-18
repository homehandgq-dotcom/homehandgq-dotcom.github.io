import { Section, SectionHeading } from "@/components/ui/primitives";
import { RichText } from "@/components/ui/RichText";
import { LinkButton } from "@/components/ui/Button";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Page } from "@/lib/supabase/types";

/** 首页新板块：协会简介全文。直接调后台「页面管理」里 about/overview 那篇正文，子页面改了主页同步变，不用重复录。 */
export function AboutIntroSection({ locale, page }: { locale: Locale; page: Page | null }) {
  const dict = getDictionary(locale);
  const body = page ? (locale === "zh" ? page.body_zh : page.body_en) : null;
  if (!body) return null;
  return (
    <Section id="about-intro">
      <div className="container-arda">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            kicker="About ARDA"
            title={page ? (locale === "zh" ? page.title_zh : page.title_en) : dict.nav.about}
          />
          <LinkButton href={`/${locale}/about`} variant="secondary" size="sm" arrow>
            {dict.common.viewAll}
          </LinkButton>
        </div>
        <div className="max-w-4xl">
          <RichText html={body} />
        </div>
      </div>
    </Section>
  );
}

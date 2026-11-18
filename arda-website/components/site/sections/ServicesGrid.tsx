import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/primitives";
import { LinkButton } from "@/components/ui/Button";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { stripHtml } from "@/lib/utils/format";
import type { Page } from "@/lib/supabase/types";

export function ServicesGrid({ locale, items }: { locale: Locale; items: Page[] }) {
  const dict = getDictionary(locale);
  if (items.length === 0) return null;
  return (
    <Section tone="mist">
      <div className="container-arda">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <SectionHeading kicker="Association Services" title={dict.home.servicesTitle} />
          <LinkButton href={`/${locale}/services`} variant="secondary" size="sm">
            {dict.common.viewAll}
          </LinkButton>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((s) => {
            // 主页直接带出子页面正文摘要（原来只有名称一行，客人必须点进去才看得到内容）；
            // 摘要取正文纯文字前段，完整内容仍在子页面
            const excerpt = stripHtml(locale === "zh" ? s.body_zh : s.body_en);
            return (
              <Link
                key={s.id}
                href={`/${locale}/services/${s.slug}`}
                className="card-interactive group flex flex-col rounded-lg border border-navy-100 bg-white p-5"
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="text-sm font-bold text-navy-900 group-hover:text-navy-700">
                    {locale === "zh" ? s.title_zh : s.title_en}
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-gold-500" aria-hidden />
                </span>
                {excerpt && <span className="mt-2 line-clamp-4 text-sm leading-relaxed text-ink-600">{excerpt}</span>}
              </Link>
            );
          })}
        </div>
      </div>
    </Section>
  );
}

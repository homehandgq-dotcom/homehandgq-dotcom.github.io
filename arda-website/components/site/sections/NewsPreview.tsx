import { Section, SectionHeading, EmptyState } from "@/components/ui/primitives";
import { NewsCard } from "@/components/site/cards/NewsCard";
import { LinkButton } from "@/components/ui/Button";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { NewsPost } from "@/lib/supabase/types";

export function NewsPreview({ locale, items }: { locale: Locale; items: NewsPost[] }) {
  const dict = getDictionary(locale);
  return (
    <Section>
      <div className="container-arda">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <SectionHeading kicker="News & Media" title={dict.home.newsTitle} />
          <LinkButton href={`/${locale}/news`} variant="secondary" size="sm" arrow>
            {dict.common.viewAll}
          </LinkButton>
        </div>
        {items.length === 0 ? (
          <EmptyState
            title={locale === "zh" ? "暂无发布的新闻" : "No published news yet"}
            desc={
              locale === "zh"
                ? "协会秘书处将陆续发布最新动态，敬请关注。"
                : "The Secretariat will publish the latest updates here soon."
            }
          />
        ) : (
          <RevealGroup className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((post) => (
              <RevealItem key={post.id}>
                <NewsCard locale={locale} post={post} />
              </RevealItem>
            ))}
          </RevealGroup>
        )}
      </div>
    </Section>
  );
}

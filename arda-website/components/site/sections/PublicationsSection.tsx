import { Section, SectionHeading } from "@/components/ui/primitives";
import { LinkButton } from "@/components/ui/Button";
import { PublicationCard } from "@/components/site/publications/PublicationCard";
import type { Locale } from "@/lib/i18n/config";
import type { PublicationWithUrls } from "@/lib/data/publications";

/** 首页「协会刊物」精选专区：没有已发布且被勾选推荐的刊物时整个区块自动隐藏 */
export function PublicationsSection({ locale, items }: { locale: Locale; items: PublicationWithUrls[] }) {
  if (items.length === 0) return null;

  return (
    <Section>
      <div className="container-arda">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            kicker="Publications"
            title={locale === "zh" ? "协会刊物" : "Publications"}
            desc={
              locale === "zh"
                ? "协会手册、会刊、杂志等公开资料，支持在线阅读。"
                : "Handbooks, journals and magazines available to read online."
            }
          />
          <LinkButton href={`/${locale}/publications`} variant="secondary" size="sm" arrow>
            {locale === "zh" ? "查看全部" : "View All"}
          </LinkButton>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <PublicationCard key={item.id} locale={locale} item={item} />
          ))}
        </div>
      </div>
    </Section>
  );
}

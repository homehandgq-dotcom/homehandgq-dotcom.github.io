import { Section, SectionHeading } from "@/components/ui/primitives";
import { LinkButton } from "@/components/ui/Button";
import { VideoGrid } from "@/components/site/videos/VideoGrid";
import type { Locale } from "@/lib/i18n/config";
import type { VideoWithUrls } from "@/lib/data/videos";

/**
 * 首页「ARDA 视界」专区（原「各界名人祝贺」专区升级而来，现展示协会全部视频
 * 分类中的精选内容）：最多展示 6 条管理员勾选「首页推荐」的已发布视频，可
 * 来自不同分类；没有任何已发布且勾选首页推荐的记录时，整个区块自动隐藏
 * （不渲染空状态占位）。
 */
export function VideosSection({
  locale,
  items,
}: {
  locale: Locale;
  items: VideoWithUrls[];
}) {
  if (items.length === 0) return null;

  return (
    <Section tone="mist">
      <div className="container-arda">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            kicker="ARDA Videos"
            title={locale === "zh" ? "ARDA 视界" : "ARDA Videos"}
            desc={
              locale === "zh"
                ? "记录协会发展，汇聚行业声音，分享精彩时刻。"
                : "Documenting our journey, bringing together industry voices, and sharing memorable moments."
            }
          />
          <LinkButton href={`/${locale}/videos`} variant="secondary" size="sm" arrow>
            {locale === "zh" ? "查看全部" : "View All"}
          </LinkButton>
        </div>
        <VideoGrid locale={locale} items={items} />
      </div>
    </Section>
  );
}

import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { HeroSlide } from "@/lib/data/siteSettings";
import { HeroContent } from "./HeroContent";

export function Hero({ locale, slide }: { locale: Locale; slide: HeroSlide | null }) {
  const dict = getDictionary(locale);
  const kicker = slide ? (locale === "zh" ? slide.kicker_zh : slide.kicker_en) : dict.home.heroKicker;
  const title = slide
    ? locale === "zh"
      ? slide.title_zh
      : slide.title_en
    : locale === "zh"
      ? "凝心聚力，链通全美餐饮产业"
      : "Uniting and Empowering the U.S. Restaurant Industry";
  const subtitle = slide ? (locale === "zh" ? slide.subtitle_zh : slide.subtitle_en) : "";
  // Hero 主图：来自后台 home_hero 设置的 image 字段（不分中英文，两个语言版本
  // 共用同一张图）；留空时保留原有纯深蓝网格背景，不受影响
  const heroImage = slide?.image?.trim() || "";

  return (
    <section className="relative overflow-hidden bg-navy-900 text-white">
      {/* 主图铺满 Hero 区域（cover + center），中英文首页共用同一张图 */}
      {heroImage && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
          aria-hidden
        />
      )}
      {/* 深蓝色半透明遮罩：保证白色文字清晰可读，同时不把图片遮得太暗 */}
      {heroImage && <div className="absolute inset-0 bg-navy-900/55" aria-hidden />}
      {/* 装饰性背景：光晕呼吸 + 网格缓慢漂移，均为纯 CSS 关键帧驱动（见 globals.css），
          不引入额外 JS 动画开销；文字内容层级更高，保证可读性不受影响。
          有主图时网格透明度调低，让网格以更弱的存在感叠加在图片之上 */}
      <div
        className="arda-hero-glow absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 20%, rgba(199,165,116,0.25), transparent 45%), radial-gradient(circle at 85% 75%, rgba(47,122,217,0.18), transparent 45%)",
        }}
        aria-hidden
      />
      <div
        className={`arda-hero-grid absolute inset-0 ${heroImage ? "opacity-[0.01]" : "opacity-[0.06]"}`}
        aria-hidden
      />
      <div className="container-arda relative flex min-h-[560px] flex-col justify-center py-24 lg:min-h-[640px]">
        <HeroContent locale={locale} kicker={kicker} title={title} subtitle={subtitle} />
      </div>
    </section>
  );
}

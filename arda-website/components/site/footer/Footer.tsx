import Link from "next/link";
import { getNavigation } from "@/lib/data/navigation";
import { getContactInfo, getSiteLogo } from "@/lib/data/siteSettings";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { NewsletterForm } from "@/components/forms/NewsletterForm";

const legalLinks = [
  { slug: "privacy-policy", label_zh: "隐私政策", label_en: "Privacy Policy" },
  { slug: "terms-of-use", label_zh: "使用条款", label_en: "Terms of Use" },
  { slug: "cookie-policy", label_zh: "Cookie 政策", label_en: "Cookie Policy" },
  { slug: "accessibility-statement", label_zh: "无障碍声明", label_en: "Accessibility Statement" },
  { slug: "conflict-of-interest", label_zh: "利益冲突政策", label_en: "Conflict of Interest" },
  { slug: "financial-transparency", label_zh: "财务透明度", label_en: "Financial Transparency" },
  { slug: "disclaimer", label_zh: "网站免责声明", label_en: "Disclaimer" },
];

export async function Footer({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const [footerNav, contact, logoUrl] = await Promise.all([
    getNavigation("footer"),
    getContactInfo(),
    getSiteLogo(),
  ]);

  const year = new Date().getFullYear();

  return (
    <footer className="bg-navy-900 text-navy-100">
      <div className="container-arda py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-3">
              {logoUrl ? (
                // 完整 Logo 图片已包含协会中英文名称，右侧不再重复展示品牌文字；
                // Footer 背景是深藏青色，用 brightness-0 + invert 把 Logo 图片（无论
                // 原本是什么颜色）统一转成纯白色剪影，保证在深色背景上清晰可辨
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoUrl}
                  alt={dict.brand.fullName}
                  className="h-11 w-auto max-w-[220px] object-contain brightness-0 invert sm:max-w-[260px]"
                />
              ) : (
                <>
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-sm font-bold text-gold-300">
                    ARDA
                  </span>
                  <span className="text-sm font-bold text-white">{dict.brand.fullName}</span>
                </>
              )}
            </div>
            <p className="mt-4 text-sm leading-relaxed text-navy-200">{dict.footer.orgLine}</p>
          </div>

          <div>
            <p className="mb-4 text-sm font-bold uppercase tracking-wide text-gold-300">
              {dict.footer.quickLinks}
            </p>
            <ul className="space-y-2.5 text-sm text-navy-200">
              {footerNav.map((item) => (
                <li key={item.id}>
                  <Link href={`/${locale}${item.url}`} className="hover:text-white">
                    {locale === "zh" ? item.label_zh : item.label_en}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-4 text-sm font-bold uppercase tracking-wide text-gold-300">
              {dict.footer.contactUs}
            </p>
            <ul className="space-y-2.5 text-sm text-navy-200">
              <li>{locale === "zh" ? contact.address_zh : contact.address_en}</li>
              <li>{contact.phone}</li>
              <li>
                <a href={`mailto:${contact.email}`} className="hover:text-white">
                  {contact.email}
                </a>
              </li>
              <li className="text-navy-300">
                {locale === "zh" ? contact.office_hours_zh : contact.office_hours_en}
              </li>
            </ul>
          </div>

          <div>
            <p className="mb-4 text-sm font-bold uppercase tracking-wide text-gold-300">
              {dict.footer.newsletterTitle}
            </p>
            <p className="mb-4 text-sm text-navy-200">{dict.footer.newsletterDesc}</p>
            <NewsletterForm locale={locale} variant="dark" />
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-8 text-xs text-navy-300 md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {dict.brand.fullName}. {dict.footer.rights}
          </p>
          <nav aria-label="Legal" className="flex flex-wrap gap-x-5 gap-y-2">
            {legalLinks.map((l) => (
              <Link key={l.slug} href={`/${locale}/legal/${l.slug}`} className="hover:text-white">
                {locale === "zh" ? l.label_zh : l.label_en}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}

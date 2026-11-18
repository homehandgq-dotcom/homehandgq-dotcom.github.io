import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getContactInfo } from "@/lib/data/siteSettings";
import { listChapters } from "@/lib/data/chapters";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { PageHero } from "@/components/site/PageHero";
import { Container } from "@/components/ui/primitives";
import { ContactForm } from "@/components/forms/ContactForm";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = (isLocale(rawLocale) ? rawLocale : "zh") as Locale;
  const dict = getDictionary(locale);
  return { title: dict.nav.contact };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale = rawLocale as Locale;
  const dict = getDictionary(locale);
  const [contact, chapters] = await Promise.all([getContactInfo(), listChapters()]);

  return (
    <>
      <Breadcrumbs locale={locale} items={[{ label: dict.nav.contact }]} />
      <PageHero kicker="Contact" title={dict.nav.contact} />
      <Container className="py-14 lg:py-20">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-[1fr_420px]">
          <div className="space-y-10">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <InfoCard icon={<MapPin className="h-5 w-5" aria-hidden />} label={locale === "zh" ? "办公地址" : "Office Address"}>
                {locale === "zh" ? contact.address_zh : contact.address_en}
              </InfoCard>
              <InfoCard icon={<Clock className="h-5 w-5" aria-hidden />} label={locale === "zh" ? "工作时间" : "Office Hours"}>
                {locale === "zh" ? contact.office_hours_zh : contact.office_hours_en}
              </InfoCard>
              <InfoCard icon={<Phone className="h-5 w-5" aria-hidden />} label={locale === "zh" ? "电话" : "Phone"}>
                {contact.phone}
              </InfoCard>
              <InfoCard icon={<Mail className="h-5 w-5" aria-hidden />} label={locale === "zh" ? "邮箱" : "Email"}>
                <a href={`mailto:${contact.email}`} className="hover:underline">{contact.email}</a>
              </InfoCard>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <ContactChannel label={locale === "zh" ? "媒体联系" : "Media"} email={contact.media_email} />
              <ContactChannel label={locale === "zh" ? "商务合作" : "Business Cooperation"} email={contact.business_email} />
              <ContactChannel label={locale === "zh" ? "会员服务" : "Membership Services"} email={contact.membership_email} />
            </div>

            <div className="overflow-hidden rounded-lg border border-navy-100">
              <iframe
                title={locale === "zh" ? "协会位置地图" : "ARDA location map"}
                src={`https://www.google.com/maps?q=${contact.map_lat},${contact.map_lng}&output=embed`}
                className="h-64 w-full"
                loading="lazy"
              />
            </div>

            <div>
              <h2 className="mb-4 text-lg font-bold text-navy-900">
                {locale === "zh" ? "地方分会联系入口" : "Chapter Contacts"}
              </h2>
              <div className="flex flex-wrap gap-2">
                {chapters.map((c) => (
                  <Link
                    key={c.id}
                    href={`/${locale}/chapters/${c.slug}`}
                    className="rounded-full border border-navy-200 px-4 py-2 text-sm font-medium text-navy-800 hover:bg-navy-50"
                  >
                    {locale === "zh" ? c.name_zh : c.name_en}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <ContactForm locale={locale} />
          </aside>
        </div>
      </Container>
    </>
  );
}

function InfoCard({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-navy-100 bg-white p-5">
      <span className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-navy-50 text-navy-700">
        {icon}
      </span>
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">{label}</p>
      <p className="mt-1 text-sm font-medium text-navy-900">{children}</p>
    </div>
  );
}

function ContactChannel({ label, email }: { label: string; email: string }) {
  return (
    <a href={`mailto:${email}`} className="rounded-lg border border-navy-100 bg-mist p-4 text-center hover:bg-navy-50">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">{label}</p>
      <p className="mt-1 text-sm font-bold text-navy-900">{email}</p>
    </a>
  );
}

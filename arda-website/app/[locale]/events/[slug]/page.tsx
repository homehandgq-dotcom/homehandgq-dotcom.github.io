import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Download, MapPin } from "lucide-react";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getEventBySlug, countEventRegistrations } from "@/lib/data/events";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { Container, Badge } from "@/components/ui/primitives";
import { RichText } from "@/components/ui/RichText";
import { CoverImage } from "@/components/ui/CoverImage";
import { EventRegistrationForm } from "@/components/forms/EventRegistrationForm";
import { formatDateTime } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const locale = (isLocale(rawLocale) ? rawLocale : "zh") as Locale;
  const event = await getEventBySlug(slug);
  if (!event) return {};
  return {
    title: locale === "zh" ? event.title_zh : event.title_en,
    description: locale === "zh" ? event.summary_zh || undefined : event.summary_en || undefined,
  };
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: rawLocale, slug } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale = rawLocale as Locale;
  const dict = getDictionary(locale);

  const event = await getEventBySlug(slug);
  if (!event) notFound();

  const title = locale === "zh" ? event.title_zh : event.title_en;
  const location = locale === "zh" ? event.location_zh : event.location_en;
  const host = locale === "zh" ? event.host_zh : event.host_en;
  const coHosts = locale === "zh" ? event.co_hosts_zh : event.co_hosts_en;

  const registeredCount = event.capacity ? await countEventRegistrations(event.id) : 0;
  const isFull = event.capacity ? registeredCount >= event.capacity : false;
  const deadlinePassed = event.registration_deadline
    ? new Date(event.registration_deadline) < new Date()
    : false;
  const canRegister = event.event_status === "upcoming" || event.event_status === "ongoing";

  return (
    <>
      <Breadcrumbs
        locale={locale}
        items={[{ label: dict.nav.events, href: `/${locale}/events` }, { label: title }]}
      />
      <Container className="py-14 lg:py-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_360px]">
          <div>
            <Badge tone="navy" className="mb-3">
              {locale === "zh" ? "活动详情" : "Event Details"}
            </Badge>
            <h1 className="text-3xl font-extrabold text-navy-900 lg:text-4xl">{title}</h1>

            <CoverImage src={event.cover_image} alt={title} className="my-8 aspect-[16/9] rounded-lg" />

            <RichText html={locale === "zh" ? event.body_zh : event.body_en} />

            {event.event_status === "past" && (event.recap_zh || event.recap_en) && (
              <div className="mt-10">
                <h2 className="mb-3 text-xl font-bold text-navy-900">
                  {locale === "zh" ? "活动回顾" : "Event Recap"}
                </h2>
                <RichText html={locale === "zh" ? event.recap_zh : event.recap_en} />
              </div>
            )}

            {event.gallery && event.gallery.length > 0 && (
              <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {event.gallery.map((src, i) => (
                  <CoverImage key={i} src={src} alt={`${title} ${i + 1}`} className="aspect-square rounded-lg" />
                ))}
              </div>
            )}

            {event.attachment_urls && event.attachment_urls.length > 0 && (
              <div className="mt-10">
                <h2 className="mb-3 text-lg font-bold text-navy-900">
                  {locale === "zh" ? "相关下载" : "Downloads"}
                </h2>
                <ul className="space-y-2">
                  {event.attachment_urls.map((url, i) => (
                    <li key={i}>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm font-medium text-navy-700 hover:underline"
                      >
                        <Download className="h-4 w-4" aria-hidden />
                        {locale === "zh" ? `下载文件 ${i + 1}` : `Download File ${i + 1}`}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <aside className="space-y-6">
            <div className="space-y-4 rounded-lg border border-navy-100 bg-mist p-6 text-sm">
              <InfoRow label={dict.common.date} value={formatDateTime(event.start_at, locale, event.timezone)} />
              {location && <InfoRow label={dict.common.location} value={location} />}
              {host && <InfoRow label={locale === "zh" ? "主办方" : "Host"} value={host} />}
              {coHosts && <InfoRow label={locale === "zh" ? "协办方" : "Co-hosts"} value={coHosts} />}
              {event.registration_deadline && (
                <InfoRow
                  label={locale === "zh" ? "报名截止" : "Registration Deadline"}
                  value={formatDateTime(event.registration_deadline, locale, event.timezone)}
                />
              )}
              {event.capacity && (
                <InfoRow
                  label={locale === "zh" ? "人数限制" : "Capacity"}
                  value={`${registeredCount} / ${event.capacity}`}
                />
              )}
            </div>

            {event.map_lat && event.map_lng && (
              <div className="overflow-hidden rounded-lg border border-navy-100">
                <iframe
                  title={locale === "zh" ? "活动地点地图" : "Event location map"}
                  src={`https://www.google.com/maps?q=${event.map_lat},${event.map_lng}&output=embed`}
                  className="h-48 w-full"
                  loading="lazy"
                />
                <p className="flex items-center gap-1.5 p-3 text-xs text-ink-500">
                  <MapPin className="h-3.5 w-3.5" aria-hidden /> {location}
                </p>
              </div>
            )}

            <EventRegistrationForm
              locale={locale}
              eventId={event.id}
              disabled={!canRegister || isFull || deadlinePassed}
              disabledReason={
                event.event_status === "past"
                  ? locale === "zh"
                    ? "本活动已结束，感谢您的关注。"
                    : "This event has ended. Thank you for your interest."
                  : event.event_status === "cancelled"
                    ? locale === "zh"
                      ? "本活动已取消。"
                      : "This event has been cancelled."
                    : deadlinePassed
                      ? locale === "zh"
                        ? "报名已截止。"
                        : "Registration has closed."
                      : isFull
                        ? locale === "zh"
                          ? "名额已满，敬请关注下期活动。"
                          : "This event is full. Please check back for future events."
                        : undefined
              }
            />
          </aside>
        </div>
      </Container>
    </>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">{label}</p>
      <p className="mt-1 font-medium text-navy-900">{value}</p>
    </div>
  );
}

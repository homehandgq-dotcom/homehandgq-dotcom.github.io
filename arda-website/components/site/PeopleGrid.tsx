"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Building2, Mail, Phone, X } from "lucide-react";
import { PersonAvatar } from "@/components/site/PersonAvatar";
import { Badge, EmptyState } from "@/components/ui/primitives";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { LeadershipPerson } from "@/lib/supabase/types";

export function PeopleGrid({
  locale,
  people,
  emptyLabel,
}: {
  locale: Locale;
  people: LeadershipPerson[];
  emptyLabel?: string;
}) {
  const dict = getDictionary(locale);
  // 点击人员卡片弹出详情卡片展示完整文字介绍（bio_zh/bio_en），适用于董事局、
  // 执行理事会、顾问委员会（总顾问/荣誉顾问等）、监事会、秘书处各部门等所有
  // 使用本组件的人员列表页面
  const [selected, setSelected] = useState<LeadershipPerson | null>(null);

  useEffect(() => {
    if (!selected) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setSelected(null);
    }
    document.addEventListener("keydown", onKeyDown);
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = original;
    };
  }, [selected]);

  if (people.length === 0) {
    return (
      <EmptyState
        title={emptyLabel || (locale === "zh" ? "人员信息筹备中" : "Roster coming soon")}
        desc={
          locale === "zh"
            ? "相关人员任命信息将由协会秘书处持续更新。"
            : "Appointments will be updated by the Secretariat as they are confirmed."
        }
      />
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {people.map((p) => {
          const name = locale === "zh" ? p.name_zh : p.name_en;
          const title = locale === "zh" ? p.title_zh : p.title_en;
          const company = locale === "zh" ? p.company_zh : p.company_en;
          const bio = locale === "zh" ? p.bio_zh : p.bio_en;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelected(p)}
              className="card-interactive flex gap-4 rounded-lg border border-navy-100 bg-white p-5 text-left"
            >
              <PersonAvatar src={p.avatar_url} name={name} className="h-16 w-16 shrink-0" />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-navy-900">{name}</p>
                <p className="mt-0.5 text-xs font-medium text-gold-600">{title}</p>
                {company && <p className="mt-0.5 truncate text-xs text-ink-500">{company}</p>}
                {p.is_tba && (
                  <Badge tone="neutral" className="mt-2">
                    {dict.common.tbaBadge}
                  </Badge>
                )}
                {bio && <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-ink-600">{bio}</p>}
                {p.show_contact && (p.contact_email || p.contact_phone) && (
                  <div className="mt-2 space-y-1 text-xs text-ink-500">
                    {p.contact_email && (
                      <span className="flex items-center gap-1.5">
                        <Mail className="h-3 w-3" aria-hidden /> {p.contact_email}
                      </span>
                    )}
                    {p.contact_phone && (
                      <span className="flex items-center gap-1.5">
                        <Phone className="h-3 w-3" aria-hidden /> {p.contact_phone}
                      </span>
                    )}
                  </div>
                )}
                <span className="mt-2 inline-block text-xs font-semibold text-navy-700 underline underline-offset-2">
                  {locale === "zh" ? "查看简介 →" : "Read bio →"}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {selected && <PersonModal locale={locale} person={selected} onClose={() => setSelected(null)} />}
    </>
  );
}

function PersonModal({
  locale,
  person,
  onClose,
}: {
  locale: Locale;
  person: LeadershipPerson;
  onClose: () => void;
}) {
  const name = locale === "zh" ? person.name_zh : person.name_en;
  const title = locale === "zh" ? person.title_zh : person.title_en;
  const company = locale === "zh" ? person.company_zh : person.company_en;
  const bio = locale === "zh" ? person.bio_zh : person.bio_en;
  const hasContact =
    person.show_contact && (person.contact_email || person.contact_phone || person.qr_code_url);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/60 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="person-modal-name"
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-8 shadow-2xl sm:p-10"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={locale === "zh" ? "关闭" : "Close"}
          className="absolute right-5 top-5 rounded-full p-2 text-navy-500 hover:bg-navy-50 hover:text-navy-800"
        >
          <X className="h-6 w-6" aria-hidden />
        </button>

        <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:items-center sm:text-left">
          <PersonAvatar
            src={person.avatar_url}
            name={name}
            className="h-28 w-28 shrink-0 sm:h-32 sm:w-32"
            textClassName="text-3xl"
            sizes="128px"
          />
          <div className="min-w-0">
            <p id="person-modal-name" className="text-2xl font-bold text-navy-900 sm:text-[28px]">
              {name}
            </p>
            <p className="mt-1 text-base font-semibold text-gold-600">{title}</p>
            {company && (
              <p className="mt-1 flex items-center justify-center gap-1.5 text-sm text-ink-500 sm:justify-start">
                <Building2 className="h-4 w-4 shrink-0" aria-hidden /> {company}
              </p>
            )}
            {person.is_tba && (
              <Badge tone="neutral" className="mt-2">
                {locale === "zh" ? "待定" : "TBA"}
              </Badge>
            )}
          </div>
        </div>

        <div className="mt-8 border-t border-navy-100 pt-6">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-400">
            {locale === "zh" ? "个人简介" : "About"}
          </p>
          {bio ? (
            <p className="whitespace-pre-line text-base leading-loose text-ink-700">{bio}</p>
          ) : (
            <p className="text-sm text-ink-500">
              {locale === "zh"
                ? "暂无详细简介，相关介绍将由协会秘书处持续更新。"
                : "No detailed bio yet — this will be updated by the Secretariat."}
            </p>
          )}
        </div>

        {hasContact && (
          <div className="mt-8 space-y-3 border-t border-navy-100 pt-6">
            <p className="mb-1 text-xs font-bold uppercase tracking-wide text-ink-400">
              {locale === "zh" ? "联系方式" : "Contact"}
            </p>
            {person.contact_phone && (
              <p className="flex items-center gap-3 text-base text-ink-700">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy-50 text-navy-700">
                  <Phone className="h-4 w-4" aria-hidden />
                </span>
                {person.contact_phone}
              </p>
            )}
            {person.contact_email && (
              <a
                href={`mailto:${person.contact_email}`}
                className="flex items-center gap-3 text-base text-ink-700 hover:text-navy-800"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy-50 text-navy-700">
                  <Mail className="h-4 w-4" aria-hidden />
                </span>
                {person.contact_email}
              </a>
            )}
            {person.qr_code_url && (
              <div className="pt-1">
                <div className="relative h-28 w-28 overflow-hidden rounded-lg border border-navy-100">
                  <Image src={person.qr_code_url} alt={locale === "zh" ? "联系二维码" : "Contact QR code"} fill sizes="112px" className="object-contain" />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

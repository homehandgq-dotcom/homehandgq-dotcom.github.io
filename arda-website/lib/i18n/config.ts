export const locales = ["zh", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "zh";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** 双语字段取值辅助：优先当前语言，缺失时回退到另一语言，并可用于后台"缺翻译"提醒 */
export function pickBilingual(
  locale: Locale,
  zh: string | null | undefined,
  en: string | null | undefined
): string {
  if (locale === "zh") return zh || en || "";
  return en || zh || "";
}

export function isTranslationMissing(
  zh: string | null | undefined,
  en: string | null | undefined
): boolean {
  return !zh || !en;
}

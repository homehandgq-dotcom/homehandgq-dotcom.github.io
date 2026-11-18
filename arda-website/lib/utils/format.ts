import type { Locale } from "@/lib/i18n/config";

export function formatDate(value: string | null | undefined, locale: Locale): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateTime(value: string | null | undefined, locale: Locale, timeZone?: string): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString(locale === "zh" ? "zh-CN" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone,
    timeZoneName: "short",
  });
}

export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + "…";
}

/**
 * 富文本字段（后台"简介"这类 type: "richtext" 字段，存的是 <p>...</p> 这样的 HTML）
 * 在卡片摘要里只需要显示纯文字，不能直接把 HTML 字符串塞进 JSX 文本节点——React 会把
 * 尖括号原样转义显示出来，变成 "<p style="...">正文</p>" 这种乱码。用这个函数先把
 * 标签去掉、常见 HTML 实体解码，只保留纯文字，再显示。
 */
const ZH_COUNT_NUMERALS: Record<number, string> = {
  1: "一",
  2: "两",
  3: "三",
  4: "四",
  5: "五",
  6: "六",
  7: "七",
  8: "八",
  9: "九",
  10: "十",
};

/**
 * 首页"专业委员会"板块、委员会列表页标题里的"六大专业委员会"这个"六"以前是
 * 写死的文案；委员会数量后台随时可能增减（比如新增了"多元产业发展委员会"
 * 变成七个），写死的数字就会跟实际数量对不上。改用这个函数根据当前真实
 * 委员会条数现算，数量变了标题也会跟着自动变，不用再改代码
 */
export function zhCountNumeral(count: number): string {
  return ZH_COUNT_NUMERALS[count] ?? String(count);
}

export function stripHtml(html: string | null | undefined): string {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

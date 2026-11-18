"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { subscribeNewsletter } from "@/lib/actions/public-forms";
import { cn } from "@/lib/utils/cn";

export function NewsletterForm({
  locale,
  variant = "light",
}: {
  locale: Locale;
  variant?: "light" | "dark";
}) {
  const dict = getDictionary(locale);
  const [email, setEmail] = useState("");
  const [website_hp, setHp] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    const res = await subscribeNewsletter({ email, locale_pref: locale, website_hp });
    if (res.ok) {
      setState("success");
      setEmail("");
    } else {
      setState("error");
      setMessage(res.error);
    }
  }

  if (state === "success") {
    return (
      <p className={cn("text-sm font-medium", variant === "dark" ? "text-gold-300" : "text-green-700")}>
        {locale === "zh" ? "订阅成功，感谢关注！" : "Subscribed! Thank you for following ARDA."}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
      <label htmlFor="newsletter-email" className="sr-only">
        {dict.footer.newsletterPlaceholder}
      </label>
      <input
        id="newsletter-email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={dict.footer.newsletterPlaceholder}
        className={cn(
          "h-11 flex-1 rounded border px-3 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-400",
          variant === "dark"
            ? "border-white/20 bg-white/5 text-white placeholder:text-navy-300"
            : "border-navy-200 text-ink-900"
        )}
      />
      <input
        type="text"
        value={website_hp}
        onChange={(e) => setHp(e.target.value)}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />
      <button
        type="submit"
        disabled={state === "loading"}
        className="h-11 shrink-0 rounded bg-gold-400 px-5 text-sm font-semibold text-navy-900 hover:bg-gold-300 disabled:opacity-60"
      >
        {state === "loading" ? dict.common.submitting : dict.footer.newsletterButton}
      </button>
      {state === "error" && <p className="text-xs text-red-400 sm:ml-2 sm:self-center">{message}</p>}
    </form>
  );
}

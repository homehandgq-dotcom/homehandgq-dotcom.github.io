import { LinkButton } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

export function DualCta({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  return (
    <section className="grid grid-cols-1 lg:grid-cols-2">
      <Reveal className="flex flex-col justify-center gap-5 bg-navy-900 px-8 py-16 text-white lg:px-16">
        <h2 className="text-2xl font-bold lg:text-3xl">{dict.home.ctaJoinTitle}</h2>
        <p className="max-w-md text-navy-100">{dict.home.ctaJoinDesc}</p>
        <div>
          <LinkButton href={`/${locale}/membership/apply`} variant="outline-light" size="lg" arrow>
            {dict.nav.applyNow}
          </LinkButton>
        </div>
      </Reveal>
      <Reveal
        delay={0.1}
        className="flex flex-col justify-center gap-5 bg-gold-400 px-8 py-16 text-navy-900 lg:px-16"
      >
        <h2 className="text-2xl font-bold lg:text-3xl">{dict.home.ctaDonateTitle}</h2>
        <p className="max-w-md">{dict.home.ctaDonateDesc}</p>
        <div>
          <LinkButton href={`/${locale}/donate`} variant="primary" size="lg" arrow>
            {dict.nav.donate}
          </LinkButton>
        </div>
      </Reveal>
    </section>
  );
}

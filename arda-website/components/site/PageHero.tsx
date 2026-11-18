import { Container } from "@/components/ui/primitives";
import { Reveal } from "@/components/motion/Reveal";
import { NetworkBackground } from "@/components/motion/NetworkBackground";

export function PageHero({
  kicker,
  title,
  desc,
  decoration = "grid",
}: {
  kicker?: string;
  title: string;
  desc?: string;
  /** 背景装饰样式：网格漂移（默认）、全球网络连线节点，或不使用装饰 */
  decoration?: "grid" | "network" | "none";
}) {
  return (
    <div className="relative overflow-hidden border-b border-navy-100 bg-navy-900 text-white">
      {decoration !== "none" && (
        <div
          className="arda-hero-glow absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, rgba(199,165,116,0.2), transparent 45%)",
          }}
          aria-hidden
        />
      )}
      {decoration === "grid" && (
        <div className="arda-hero-grid absolute inset-0 opacity-[0.05]" aria-hidden />
      )}
      {decoration === "network" && (
        <NetworkBackground className="pointer-events-none absolute inset-x-0 bottom-0 h-20 w-full opacity-50" />
      )}
      <Container className="relative py-14 lg:py-20">
        <Reveal y={16}>
          {kicker && (
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-gold-300">{kicker}</p>
          )}
          <h1 className="max-w-3xl text-3xl font-extrabold lg:text-4xl">{title}</h1>
          {desc && <p className="mt-4 max-w-2xl text-navy-100">{desc}</p>}
        </Reveal>
      </Container>
    </div>
  );
}

import Link from "next/link";
import { LuArrowUpRight, LuCheck, LuPlus } from "react-icons/lu";
import { AutoVideo, Reveal } from "@/components/landing/primitives";
import { ZButton } from "@/components/landing/button";
import { formatPrice, type Service } from "@/lib/landing-services";
import { SERVICE_PAGES, fromPrice, serviceHref } from "@/lib/service-pages";
import { cn } from "@/lib/utils";

export function ServiceCard({ service, delay = 0 }: { service: Service; delay?: number }) {
  const page = SERVICE_PAGES[service.id];
  return (
    <Reveal delay={delay} className="min-w-0">
      <Link
        href={serviceHref(service.id)}
        className="group flex h-full flex-col overflow-hidden rounded-[26px] border border-(--zl-line) bg-(--zl-surface) transition-all duration-500 hover:-translate-y-1 hover:border-(--zl-text)/20 hover:shadow-[0_30px_70px_-34px_rgb(255_61_134/0.5)]"
      >
        <div className="relative aspect-[16/10] overflow-hidden">
          <AutoVideo src={page.hero} className="transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <span className="absolute top-3.5 right-3.5 rounded-full bg-black/45 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
            {fromPrice(service)}
          </span>
        </div>
        <div className="flex flex-1 flex-col p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <h3 className="zl-display text-xl font-semibold sm:text-[1.4rem]">{service.name}</h3>
            <LuArrowUpRight className="mt-1 size-5 shrink-0 text-(--zl-muted) transition-all duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#ff3d86]" />
          </div>
          <p className="mt-2 text-sm leading-relaxed text-(--zl-muted)">{service.blurb}</p>
        </div>
      </Link>
    </Reveal>
  );
}

export function TierCards({ service }: { service: Service }) {
  const featuredIndex = service.tiers.length === 3 ? 1 : service.tiers.length > 3 ? 2 : -1;
  return (
    <div
      className={cn(
        "grid gap-5",
        service.tiers.length === 2 && "mx-auto max-w-3xl sm:grid-cols-2",
        service.tiers.length === 3 && "md:grid-cols-3",
        service.tiers.length > 3 && "sm:grid-cols-2 lg:grid-cols-5"
      )}
    >
      {service.tiers.map((tier, i) => {
        const { amount, suffix } = formatPrice(tier);
        const featured = i === featuredIndex;
        return (
          <Reveal key={tier.name} delay={i * 0.06} className="min-w-0">
            <div
              className={cn(
                "relative flex h-full flex-col rounded-[26px] border p-6",
                featured ? "border-transparent bg-(--zl-text) text-(--zl-bg)" : "border-(--zl-line) bg-(--zl-surface)"
              )}
            >
              {featured && (
                <span className="zl-grad-bg absolute -top-3 right-6 rounded-full px-3 py-1 text-xs font-semibold text-white">
                  Recommended
                </span>
              )}
              <p className="text-sm font-semibold uppercase tracking-[0.14em] opacity-70">{tier.name}</p>
              <p className="mt-4 flex flex-wrap items-baseline gap-x-1">
                <span className="zl-display text-[2.6rem] font-bold">{amount}</span>
                <span className="text-sm opacity-60">{suffix}</span>
              </p>
              <p className="mt-1 font-medium">{tier.quota}</p>
              {tier.perks && (
                <ul className="mt-5 flex flex-col gap-2 text-sm">
                  {tier.perks.map((p) => (
                    <li key={p} className="flex items-start gap-2">
                      <LuCheck className="mt-0.5 size-4 shrink-0 text-[#ff5b4a]" />
                      <span className="opacity-85">{p}</span>
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-auto pt-8">
                <ZButton
                  href={`/checkout?service=${service.id}&plan=${encodeURIComponent(tier.name)}`}
                  variant={featured ? "primary" : "solid"}
                  className="w-full"
                >
                  {service.cta}
                </ZButton>
              </div>
            </div>
          </Reveal>
        );
      })}
    </div>
  );
}

const FAQ = [
  {
    q: "Do failed generations use up my plan?",
    a: "No. Usage is only deducted after a generation or job completes successfully. If something fails, your credits, minutes or characters stay in your account.",
  },
  {
    q: "How do I pay?",
    a: "Through SSLCommerz, Bangladesh's secure payment gateway. Prices are shown in USD and charged in BDT at checkout, with bKash, Nagad, Rocket or a debit/credit card.",
  },
  {
    q: "Can I get a refund?",
    a: "Yes, under our Return and Refund Policy. Approved refunds are returned to your original payment method within 7 to 10 working days.",
  },
];

export function ServiceFaq() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col">
      {FAQ.map((item) => (
        <details
          key={item.q}
          className="group border-b border-(--zl-line) py-5 [&_summary::-webkit-details-marker]:hidden"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-lg font-semibold">
            {item.q}
            <LuPlus className="size-5 shrink-0 text-(--zl-muted) transition-transform duration-300 group-open:rotate-45" />
          </summary>
          <p className="mt-3 max-w-2xl leading-relaxed text-(--zl-muted)">{item.a}</p>
        </details>
      ))}
    </div>
  );
}

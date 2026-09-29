"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { LuArrowRight, LuCheck, LuShieldCheck } from "react-icons/lu";
import { Reveal, SectionHeading } from "@/components/landing/primitives";
import { CATEGORIES, formatPrice, servicesIn, type ServiceCategory } from "@/lib/landing-services";
import { cn } from "@/lib/utils";

export function PricingSection() {
  const [category, setCategory] = React.useState<ServiceCategory>("music");
  const services = servicesIn(category);
  const [serviceId, setServiceId] = React.useState(services[0].id);
  const service = services.find((s) => s.id === serviceId) ?? services[0];

  function pickCategory(c: ServiceCategory) {
    setCategory(c);
    setServiceId(servicesIn(c)[0].id);
  }

  const featuredIndex = service.tiers.length === 3 ? 1 : service.tiers.length > 3 ? 2 : -1;

  return (
    <section id="pricing" className="scroll-mt-24 px-5 py-24 sm:py-32">
      <SectionHeading
        eyebrow="Pricing"
        title={
          <>
            Pay for what you make.
            <br />
            <span className="text-(--zl-muted)">Nothing hidden.</span>
          </>
        }
        sub="Clear prices for every service, paid through secure SSLCommerz checkout. Failed generations never use up your allowance."
      />

      <Reveal className="mx-auto mt-14 flex max-w-7xl flex-col items-center gap-6">
        <div className="flex max-w-full gap-1 overflow-x-auto rounded-full border border-(--zl-line) bg-(--zl-surface) p-1.5">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => pickCategory(c.id)}
              className={cn(
                "relative shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors sm:px-6",
                category === c.id ? "text-(--zl-bg)" : "text-(--zl-muted) hover:text-(--zl-text)"
              )}
            >
              {category === c.id && (
                <motion.span
                  layoutId="zl-cat-pill"
                  className="absolute inset-0 rounded-full bg-(--zl-text)"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <span className="relative">{c.label}</span>
            </button>
          ))}
        </div>

        {services.length > 1 && (
          <div className="flex max-w-4xl flex-wrap justify-center gap-2">
            {services.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setServiceId(s.id)}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                  s.id === service.id
                    ? "border-[#ff3d86] text-(--zl-text)"
                    : "border-(--zl-line) text-(--zl-muted) hover:text-(--zl-text)"
                )}
              >
                {s.name}
              </button>
            ))}
          </div>
        )}
      </Reveal>

      <div className="mx-auto mt-12 max-w-7xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mb-8 flex flex-col items-center gap-2 text-center">
              <h3 className="zl-display text-3xl font-semibold sm:text-4xl">{service.name}</h3>
              <p className="max-w-xl text-(--zl-muted)">{service.blurb}</p>
            </div>

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
                  <div
                    key={tier.name}
                    className={cn(
                      "relative flex flex-col rounded-[26px] border p-6",
                      featured
                        ? "border-transparent bg-(--zl-text) text-(--zl-bg)"
                        : "border-(--zl-line) bg-(--zl-surface)"
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
                      <Link
                        href="/register"
                        className={cn(
                          "flex items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold transition-transform hover:scale-[1.02]",
                          featured ? "zl-grad-bg text-white" : "bg-(--zl-text) text-(--zl-bg)"
                        )}
                      >
                        {service.cta} <LuArrowRight className="size-4" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mx-auto mt-8 flex max-w-4xl flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-(--zl-muted)">
              {service.features.map((f) => (
                <span key={f} className="flex items-center gap-1.5">
                  <LuCheck className="size-3.5" /> {f}
                </span>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        <p className="mt-12 flex items-center justify-center gap-2 text-center text-sm text-(--zl-muted)">
          <LuShieldCheck className="size-4 shrink-0" />
          Prices in USD, charged in BDT at checkout via SSLCommerz (bKash, Nagad, Rocket and cards).
        </p>
      </div>
    </section>
  );
}

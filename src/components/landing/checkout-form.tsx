"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { LuArrowRight, LuCheck, LuEye, LuEyeOff, LuLoaderCircle } from "react-icons/lu";
import { signUp } from "@/app/actions/auth";
import { Checkbox } from "@/components/ui/checkbox";
import { ZButton } from "@/components/landing/button";
import { FromPrice, PriceBlock, useCurrency } from "@/components/landing/currency";
import { CATEGORIES, SERVICES, servicesIn, type ServiceCategory } from "@/lib/landing-services";
import { USD_TO_BDT_RATE, formatMoney, periodSuffix } from "@/lib/currency";
import { cn } from "@/lib/utils";

function billing(period: "year" | "month" | "avatar" | null | undefined) {
  if (period === "year") return "Billed yearly";
  if (period === "month") return "Billed monthly";
  if (period === "avatar") return "Per avatar";
  return "One-time";
}

const fieldLabel = "text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-white/50";
const fieldInput =
  "w-full border-b border-white/20 bg-transparent py-3 text-lg text-white outline-none transition-colors placeholder:text-white/25 focus:border-[#ff3d86]";

function StepHeading({ n, title, hint }: { n: string; title: string; hint?: string }) {
  return (
    <div className="flex items-baseline gap-5">
      <span className="zl-serif w-10 shrink-0 text-5xl leading-none text-white/25 sm:text-6xl">{n}</span>
      <div>
        <h2 className="zl-display text-2xl font-semibold sm:text-3xl">{title}</h2>
        {hint && <p className="mt-1 text-sm text-white/50">{hint}</p>}
      </div>
    </div>
  );
}

export function CheckoutForm({ initialService, initialPlan }: { initialService: string; initialPlan: string }) {
  const startService = SERVICES.find((s) => s.id === initialService) ?? SERVICES[0];
  const [serviceId, setServiceId] = React.useState(startService.id);
  const [planName, setPlanName] = React.useState(
    startService.tiers.find((t) => t.name === initialPlan)?.name ?? startService.tiers[0].name
  );
  const [category, setCategory] = React.useState<ServiceCategory>(startService.category);
  const [agreed, setAgreed] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [doneEmail, setDoneEmail] = React.useState<string | null>(null);
  const { currency } = useCurrency();

  const service = SERVICES.find((s) => s.id === serviceId) ?? SERVICES[0];
  const tier = service.tiers.find((t) => t.name === planName) ?? service.tiers[0];
  const amount = formatMoney(tier.price, currency);
  const suffix = periodSuffix(tier.period);

  function syncUrl(sId: string, plan: string) {
    window.history.replaceState(null, "", `/checkout?service=${sId}&plan=${encodeURIComponent(plan)}`);
  }

  function pickCategory(c: ServiceCategory) {
    setCategory(c);
    const first = servicesIn(c)[0];
    setServiceId(first.id);
    setPlanName(first.tiers[0].name);
    syncUrl(first.id, first.tiers[0].name);
  }

  function pickService(id: string) {
    const s = SERVICES.find((x) => x.id === id)!;
    setServiceId(id);
    setPlanName(s.tiers[0].name);
    syncUrl(id, s.tiers[0].name);
  }

  function pickPlan(name: string) {
    setPlanName(name);
    syncUrl(serviceId, name);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!agreed) return;
    setError(null);
    setPending(true);
    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") ?? "");
    const result = await signUp(formData);
    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setDoneEmail(email);
  }

  if (doneEmail) {
    return (
      <div className="mx-auto max-w-3xl py-10 text-center sm:py-20">
        <span className="zl-grad-bg mx-auto flex size-14 items-center justify-center rounded-full text-white">
          <LuCheck className="size-7" />
        </span>
        <h2 className="zl-display mt-8 text-5xl font-bold sm:text-7xl">
          Order <span className="zl-serif zl-grad-text">received.</span>
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-white/65">
          Your account for <strong className="text-white">{doneEmail}</strong> is created with the{" "}
          <strong className="text-white">{service.name}</strong> {tier.name} plan ({amount}
          {suffix}). An admin will review and approve it, and then you can sign in.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <ZButton href="/client-login">Go to client login</ZButton>
          <ZButton href="/" variant="glass" arrow={false}>
            Back to home
          </ZButton>
        </div>
      </div>
    );
  }

  const cols = service.tiers.length >= 4 ? "lg:grid-cols-5" : service.tiers.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2";

  return (
    <form onSubmit={onSubmit} className="grid items-start gap-14 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-20">
      <div className="min-w-0">
        <section>
          <StepHeading n="1" title="Choose what you need" hint="Pick a service, then a plan." />

          <div role="tablist" aria-label="Service category" className="mt-8 flex flex-wrap gap-x-7 gap-y-2 border-b border-white/10">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                role="tab"
                aria-selected={category === c.id}
                onClick={() => pickCategory(c.id)}
                className={cn(
                  "relative pb-3 text-[0.95rem] font-medium transition-colors",
                  category === c.id ? "text-white" : "text-white/45 hover:text-white/80"
                )}
              >
                {c.label}
                {category === c.id && (
                  <motion.span layoutId="checkout-tab" className="zl-grad-bg absolute inset-x-0 -bottom-px h-0.5" />
                )}
              </button>
            ))}
          </div>

          <ul className="mt-2 grid sm:grid-cols-2 sm:gap-x-12">
            {servicesIn(category).map((s) => {
              const active = s.id === serviceId;
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => pickService(s.id)}
                    aria-pressed={active}
                    className="group relative flex w-full items-baseline justify-between gap-4 border-b border-white/10 py-4 text-left"
                  >
                    {active && <span aria-hidden className="zl-grad-bg absolute top-1/2 -left-4 h-5 w-0.5 -translate-y-1/2" />}
                    <span
                      className={cn(
                        "transition-all duration-300",
                        active ? "font-semibold text-white" : "text-white/55 group-hover:translate-x-1 group-hover:text-white/90"
                      )}
                    >
                      {s.name}
                    </span>
                    <FromPrice service={s} className="shrink-0 text-xs text-white/40" />
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="mt-12">
            <p className={fieldLabel}>Plan for {service.name}</p>
            <div className={cn("mt-4 grid grid-cols-2 border-y border-white/10", cols)}>
              {service.tiers.map((t, i) => {
                const active = t.name === tier.name;
                return (
                  <button
                    key={t.name}
                    type="button"
                    onClick={() => pickPlan(t.name)}
                    aria-pressed={active}
                    className={cn(
                      "relative flex flex-col items-start gap-1 px-5 py-6 text-left transition-colors",
                      i > 0 && "sm:border-l sm:border-white/10",
                      i % 2 === 1 && "border-l border-white/10 sm:border-l",
                      active ? "bg-white/[0.05]" : "hover:bg-white/[0.02]"
                    )}
                  >
                    {active && <span aria-hidden className="zl-grad-bg absolute inset-x-0 top-0 h-0.5" />}
                    <span className={cn("text-[0.7rem] font-semibold uppercase tracking-[0.2em]", active ? "text-[#ff6b8f]" : "text-white/45")}>
                      {t.name}
                    </span>
                    <PriceBlock usd={t.price} period={t.period} size={service.tiers.length >= 4 ? "lg" : "xl"} className="mt-2" />
                    <span className="mt-2 text-sm text-white/60">{t.quota}</span>
                  </button>
                );
              })}
            </div>
            {tier.perks && (
              <p className="mt-5 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-white/55">
                {tier.perks.map((p) => (
                  <span key={p} className="flex items-center gap-2">
                    <LuCheck className="size-3.5 text-[#ff5b4a]" /> {p}
                  </span>
                ))}
              </p>
            )}
            <Link
              href={`/services/${service.id}`}
              className="mt-5 inline-block text-sm text-white/50 underline decoration-white/20 underline-offset-4 transition-colors hover:text-white"
            >
              About {service.name}
            </Link>
          </div>
        </section>

        <section className="mt-16 border-t border-white/10 pt-14">
          <StepHeading n="2" title="Create your account" hint="An admin approves it before you can sign in." />
          <div className="mt-10 grid gap-9 sm:grid-cols-2">
            {error && (
              <p className="rounded-sm border-l-2 border-[#ff3d86] bg-[#ff3d86]/10 px-4 py-3 text-sm text-[#ffb3c6] sm:col-span-2">{error}</p>
            )}
            <label className="sm:col-span-2">
              <span className={fieldLabel}>Full name</span>
              <input name="fullName" required autoComplete="name" placeholder="Jane Doe" className={fieldInput} />
            </label>
            <label>
              <span className={fieldLabel}>Email</span>
              <input name="email" type="email" required autoComplete="email" placeholder="you@example.com" className={fieldInput} />
            </label>
            <label>
              <span className={fieldLabel}>Password</span>
              <span className="relative block">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  className={cn(fieldInput, "pr-10")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute top-1/2 right-0 -translate-y-1/2 p-1 text-white/45 transition-colors hover:text-white"
                >
                  {showPassword ? <LuEyeOff className="size-5" /> : <LuEye className="size-5" />}
                </button>
              </span>
            </label>
          </div>
        </section>

        <section className="mt-16 border-t border-white/10 pt-14">
          <StepHeading n="3" title="Place your order" />
          <label className="mt-8 flex cursor-pointer items-start gap-3.5 leading-relaxed">
            <Checkbox checked={agreed} onCheckedChange={(v) => setAgreed(v === true)} className="mt-1" aria-required />
            <span className="text-[0.95rem] text-white/60">
              I have read and agree to the{" "}
              <Link href="/terms" target="_blank" className="text-white underline decoration-[#ff3d86] underline-offset-4">
                Terms &amp; Conditions
              </Link>
              ,{" "}
              <Link href="/privacy" target="_blank" className="text-white underline decoration-[#ff3d86] underline-offset-4">
                Privacy Policy
              </Link>
              , and{" "}
              <Link href="/refund-policy" target="_blank" className="text-white underline decoration-[#ff3d86] underline-offset-4">
                Return &amp; Refund Policy
              </Link>
              .
            </span>
          </label>
          <button
            type="submit"
            disabled={!agreed || pending}
            className="zl-btn zl-btn-primary zl-btn-lg mt-7 w-full disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 sm:w-auto sm:min-w-72"
          >
            {pending ? <LuLoaderCircle className="size-5 animate-spin" /> : null}
            Place order, {amount}
            {suffix}
            {!pending && <LuArrowRight className="size-5" />}
          </button>
          {!agreed && <p className="mt-3 text-xs text-white/45">Tick the box above to place your order.</p>}
        </section>
      </div>

      <aside className="min-w-0 lg:sticky lg:top-28">
        <div className="zl-receipt bg-[#15131a] px-7 pt-9 pb-14 font-mono text-[0.82rem] text-white/80">
          <p className="text-center text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-white/45">Zinetic Music</p>
          <p className="mt-1 text-center font-heading text-lg font-semibold tracking-tight text-white">Order summary</p>

          <div className="my-6 border-t border-dashed border-white/20" />

          <p className="text-[0.95rem] font-semibold text-white">{service.name}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span>{tier.name}</span>
            <span aria-hidden className="mb-1 flex-1 border-b border-dotted border-white/25" />
            <span className="text-white">
              {amount}
              {suffix}
            </span>
          </div>
          <p className="mt-1 text-white/50">{tier.quota}</p>

          {tier.perks && (
            <ul className="mt-5 space-y-1.5 text-white/55">
              {tier.perks.map((p) => (
                <li key={p} className="flex gap-2">
                  <span aria-hidden>+</span>
                  {p}
                </li>
              ))}
            </ul>
          )}

          <div className="my-6 border-t border-dashed border-white/20" />

          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-white/50">Total</p>
              <p className="mt-1 text-white/45">{billing(tier.period)}</p>
            </div>
            <PriceBlock usd={tier.price} period={tier.period} size="xl" align="right" />
          </div>

          <p className="mt-7 border-t border-dashed border-white/20 pt-5 text-[0.72rem] leading-relaxed text-white/40">
            Prices are in USD. Payments are made in BDT through SSLCommerz. BDT amounts use a rate of $1 = ৳{USD_TO_BDT_RATE}.
          </p>
        </div>
      </aside>
    </form>
  );
}

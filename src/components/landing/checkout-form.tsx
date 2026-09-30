"use client";

import * as React from "react";
import Link from "next/link";
import { LuCheck, LuCircleCheck, LuLoaderCircle, LuLock, LuTriangleAlert } from "react-icons/lu";
import { signUp } from "@/app/actions/auth";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PasswordInput } from "@/components/password-input";
import { ZButton } from "@/components/landing/button";
import { formatPrice, type Service } from "@/lib/landing-services";
import { cn } from "@/lib/utils";

function billing(period: "year" | "month" | "avatar" | null | undefined) {
  if (period === "year") return "Billed yearly";
  if (period === "month") return "Billed monthly";
  if (period === "avatar") return "Per avatar";
  return "One-time";
}

export function CheckoutForm({ service, initialPlan }: { service: Service; initialPlan: string }) {
  const [planName, setPlanName] = React.useState(initialPlan);
  const [agreed, setAgreed] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [doneEmail, setDoneEmail] = React.useState<string | null>(null);

  const tier = service.tiers.find((t) => t.name === planName) ?? service.tiers[0];
  const { amount, suffix } = formatPrice(tier);

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
      <div className="mx-auto max-w-2xl rounded-[28px] border border-(--zl-line) bg-(--zl-surface) p-8 text-center sm:p-12">
        <span className="zl-grad-bg mx-auto flex size-16 items-center justify-center rounded-full text-white">
          <LuCircleCheck className="size-8" />
        </span>
        <h2 className="zl-display mt-6 text-3xl font-semibold">Order received</h2>
        <p className="mt-3 leading-relaxed text-(--zl-muted)">
          Thank you. We created your account for <strong className="text-(--zl-text)">{doneEmail}</strong> with
          the <strong className="text-(--zl-text)">{service.name}</strong> {tier.name} plan ({amount}
          {suffix}). An admin will review and approve it, and then you can sign in.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ZButton href="/client-login">Go to client login</ZButton>
          <ZButton href="/" variant="outline" arrow={false}>
            Back to home
          </ZButton>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid items-start gap-8 lg:grid-cols-[1.25fr_1fr] lg:gap-12">
      <div className="flex min-w-0 flex-col gap-6">
        <section className="rounded-[28px] border border-(--zl-line) bg-(--zl-surface) p-6 sm:p-8">
          <h2 className="zl-display text-xl font-semibold sm:text-2xl">1. Your plan</h2>
          <p className="mt-1 text-sm text-(--zl-muted)">{service.name}</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {service.tiers.map((t) => {
              const p = formatPrice(t);
              const active = t.name === tier.name;
              return (
                <button
                  key={t.name}
                  type="button"
                  onClick={() => setPlanName(t.name)}
                  aria-pressed={active}
                  className={cn(
                    "flex items-center justify-between gap-3 rounded-2xl border p-4 text-left transition-all",
                    active
                      ? "border-[#ff3d86] bg-[#ff3d86]/10 shadow-[0_14px_40px_-24px_rgb(255_61_134/0.7)]"
                      : "border-(--zl-line) hover:border-(--zl-text)/30"
                  )}
                >
                  <span className="min-w-0">
                    <span className="block font-semibold">{t.name}</span>
                    <span className="block text-sm text-(--zl-muted)">{t.quota}</span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="zl-display block text-lg font-bold">{p.amount}</span>
                    <span className="block text-xs text-(--zl-muted)">{p.suffix}</span>
                  </span>
                </button>
              );
            })}
          </div>
          <Link
            href={`/services/${service.id}`}
            className="mt-4 inline-block text-sm text-(--zl-muted) underline underline-offset-4 hover:text-(--zl-text)"
          >
            About {service.name}
          </Link>
        </section>

        <section className="rounded-[28px] border border-(--zl-line) bg-(--zl-surface) p-6 sm:p-8">
          <h2 className="zl-display text-xl font-semibold sm:text-2xl">2. Your account</h2>
          <p className="mt-1 text-sm text-(--zl-muted)">
            We create your account now. An admin approves it before you can sign in.
          </p>
          <div className="mt-6 flex flex-col gap-5">
            {error && (
              <Alert variant="destructive">
                <LuTriangleAlert className="size-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="flex flex-col gap-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" name="fullName" placeholder="Jane Doe" required autoComplete="name" className="h-12 text-base" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                autoComplete="email"
                className="h-12 text-base"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <PasswordInput
                id="password"
                name="password"
                required
                minLength={8}
                autoComplete="new-password"
                className="h-12 text-base"
              />
              <p className="text-xs text-(--zl-muted)">At least 8 characters.</p>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-(--zl-line) bg-(--zl-surface) p-6 sm:p-8">
          <h2 className="zl-display text-xl font-semibold sm:text-2xl">3. Place your order</h2>
          <label className="mt-5 flex cursor-pointer items-start gap-3 text-sm leading-relaxed">
            <Checkbox
              checked={agreed}
              onCheckedChange={(v) => setAgreed(v === true)}
              className="mt-0.5"
              aria-required
            />
            <span className="text-(--zl-muted)">
              I have read and agree to the{" "}
              <Link href="/terms" target="_blank" className="text-(--zl-text) underline decoration-[#ff3d86] underline-offset-4">
                Terms &amp; Conditions
              </Link>
              ,{" "}
              <Link href="/privacy" target="_blank" className="text-(--zl-text) underline decoration-[#ff3d86] underline-offset-4">
                Privacy Policy
              </Link>
              , and{" "}
              <Link
                href="/refund-policy"
                target="_blank"
                className="text-(--zl-text) underline decoration-[#ff3d86] underline-offset-4"
              >
                Return &amp; Refund Policy
              </Link>
              .
            </span>
          </label>
          <button
            type="submit"
            disabled={!agreed || pending}
            className="zl-btn zl-btn-primary zl-btn-lg mt-5 w-full disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0"
          >
            {pending ? <LuLoaderCircle className="size-5 animate-spin" /> : <LuLock className="size-4" />}
            Place order, {amount}
            {suffix}
          </button>
          {!agreed && (
            <p className="mt-3 text-center text-xs text-(--zl-muted)">Tick the box above to place your order.</p>
          )}
        </section>
      </div>

      <aside className="min-w-0 lg:sticky lg:top-28">
        <div className="rounded-[28px] border border-(--zl-line) bg-(--zl-surface) p-6 sm:p-8">
          <h2 className="zl-display text-xl font-semibold sm:text-2xl">Order summary</h2>
          <div className="mt-6 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="font-semibold">{service.name}</p>
              <p className="text-sm text-(--zl-muted)">
                {tier.name} plan, {tier.quota}
              </p>
            </div>
            <p className="shrink-0 font-semibold">{amount}</p>
          </div>
          {tier.perks && (
            <ul className="mt-5 flex flex-col gap-2 border-t border-(--zl-line) pt-5 text-sm">
              {tier.perks.map((perk) => (
                <li key={perk} className="flex items-start gap-2.5 text-(--zl-muted)">
                  <LuCheck className="mt-0.5 size-4 shrink-0 text-[#ff5b4a]" />
                  {perk}
                </li>
              ))}
            </ul>
          )}
          <div className="mt-6 flex items-end justify-between border-t border-(--zl-line) pt-5">
            <div>
              <p className="text-sm text-(--zl-muted)">Total</p>
              <p className="text-xs text-(--zl-muted)">{billing(tier.period)}</p>
            </div>
            <p className="zl-display text-3xl font-bold">
              {amount}
              <span className="text-sm font-medium text-(--zl-muted)">{suffix}</span>
            </p>
          </div>
          <p className="mt-5 text-xs leading-relaxed text-(--zl-muted)">
            Prices are in USD. Payments are made in BDT through SSLCommerz.
          </p>
        </div>
      </aside>
    </form>
  );
}

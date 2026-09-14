"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LuWallet, LuLoaderCircle, LuCheck } from "react-icons/lu";
import { CHECK_PRICE, PRICING_PLANS, getPlanPricing } from "@/lib/pricing-plans";

const QUICK_CREDITS = [1, 2, 4, 8];
const MAX_CREDITS = Math.floor(1000 / CHECK_PRICE);
const USD_TO_BDT_RATE = Number(process.env.NEXT_PUBLIC_USD_TO_BDT_RATE ?? 122);

export function TopUpForm() {
  const [open, setOpen] = React.useState(false);
  const [tab, setTab] = React.useState<"plans" | "custom">("plans");
  const [credits, setCredits] = React.useState("1");
  const [planId, setPlanId] = React.useState<string | null>(null);
  const [agreed, setAgreed] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  const canSubmit = agreed && (tab === "custom" ? Number(credits) >= 1 : Boolean(planId));

  const customUsd = Number(credits) > 0 ? Number(credits) * CHECK_PRICE : 0;
  const bdtPreview = customUsd * USD_TO_BDT_RATE;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) {
      toast.error(
        tab === "plans"
          ? "Pick a bundle plan first."
          : "Please confirm you agree to the policies first."
      );
      return;
    }
    setSubmitting(true);
    try {
      const body =
        tab === "plans"
          ? { planId, agreedToPolicies: agreed }
          : { credits: Number(credits), agreedToPolicies: agreed };
      const res = await fetch("/api/payments/sslcommerz/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not start the payment.");
        setSubmitting(false);
        return;
      }
      window.location.href = data.gatewayPageUrl;
    } catch {
      toast.error("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  const agreementLabel = (
    <label className="flex items-start gap-2.5 text-sm">
      <Checkbox checked={agreed} onCheckedChange={(v) => setAgreed(v === true)} className="mt-0.5" />
      <span className="text-muted-foreground">
        I have read and agree to the{" "}
        <Link href="/terms" target="_blank" className="text-primary underline underline-offset-4">
          Terms &amp; Conditions
        </Link>
        ,{" "}
        <Link href="/privacy" target="_blank" className="text-primary underline underline-offset-4">
          Privacy Policy
        </Link>
        , and{" "}
        <Link href="/refund-policy" target="_blank" className="text-primary underline underline-offset-4">
          Refund Policy
        </Link>
        .
      </span>
    </label>
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setTab("plans");
          setPlanId(null);
          setCredits("1");
        }
      }}
    >
      <DialogTrigger
        render={
          <Button className="gap-1.5">
            <LuWallet className="size-4" />
            Top up wallet
          </Button>
        }
      />
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>Top up your wallet</DialogTitle>
          </DialogHeader>

          <Tabs
            value={tab}
            className="py-4"
            onValueChange={(v) => setTab(v as "plans" | "custom")}
          >
            <TabsList className="w-full">
              <TabsTrigger value="plans" className="flex-1">
                Bundle plans
              </TabsTrigger>
              <TabsTrigger value="custom" className="flex-1">
                Custom amount
              </TabsTrigger>
            </TabsList>

            <TabsContent value="plans" className="pt-4">
              <p className="text-xs text-muted-foreground">
                Regular price: 1 Credit = ${CHECK_PRICE.toFixed(2)} (when purchased as a single
                check). Buy Credits in bulk and the discount stacks straight into your balance, at
                the same ${CHECK_PRICE.toFixed(2)}/Credit value, so 1 Credit always equals 1
                channel check, you just get more Credits for less.
              </p>
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {PRICING_PLANS.map((plan) => {
                  const pricing = getPlanPricing(plan);
                  const selected = planId === plan.id;
                  return (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => setPlanId(plan.id)}
                      className={`relative flex flex-col gap-1 rounded-lg border p-3 text-left transition-colors ${
                        selected ? "border-primary bg-primary/5" : "hover:bg-accent"
                      }`}
                    >
                      {selected && (
                        <LuCheck className="absolute top-3 right-3 size-4 text-primary" />
                      )}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{plan.label}</span>
                        <Badge variant="secondary" className="text-[0.7rem]">
                          {plan.discountPercent}% off
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Buy {plan.checks} Credits &middot; ${pricing.perCheck.toFixed(2)}/Credit
                      </p>
                      <p className="text-lg font-heading font-semibold">
                        ${pricing.price.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Adds {plan.checks} Credits to your wallet
                      </p>
                    </button>
                  );
                })}
              </div>
              {planId && (
                <p className="mt-3 text-xs text-muted-foreground">
                  You&apos;ll be charged &#2547;
                  {Math.round(getPlanPricing(PRICING_PLANS.find((p) => p.id === planId)!).price * USD_TO_BDT_RATE).toLocaleString()}{" "}
                  BDT via SSLCommerz (&#2547;{USD_TO_BDT_RATE} = $1).
                </p>
              )}
              <div className="mt-4">{agreementLabel}</div>
            </TabsContent>

            <TabsContent value="custom" className="pt-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="topup-credits">Credits</Label>
                <Input
                  id="topup-credits"
                  type="number"
                  min="1"
                  max={MAX_CREDITS}
                  step="1"
                  value={credits}
                  onChange={(e) => setCredits(e.target.value)}
                  className="h-11"
                />
                <div className="flex flex-wrap gap-2">
                  {QUICK_CREDITS.map((c) => (
                    <Button
                      key={c}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setCredits(String(c))}
                    >
                      {c} {c === 1 ? "Credit" : "Credits"}
                    </Button>
                  ))}
                </div>
                {customUsd > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {credits} Credit{Number(credits) === 1 ? "" : "s"} = ${customUsd.toFixed(2)},
                    charged as &#2547;{Math.round(bdtPreview).toLocaleString()} BDT via SSLCommerz
                    (&#2547;{USD_TO_BDT_RATE} = $1). No bundle discount applies to custom amounts.
                  </p>
                )}
              </div>
              <div className="mt-4">{agreementLabel}</div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button type="submit" disabled={submitting || !canSubmit} className="w-full gap-2">
              {submitting && <LuLoaderCircle className="size-4 animate-spin" />}
              Continue to payment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

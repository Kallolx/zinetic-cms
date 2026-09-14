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

const QUICK_AMOUNTS = [CHECK_PRICE, CHECK_PRICE * 2, CHECK_PRICE * 4, CHECK_PRICE * 8];
const USD_TO_BDT_RATE = Number(process.env.NEXT_PUBLIC_USD_TO_BDT_RATE ?? 122);

export function TopUpForm() {
  const [open, setOpen] = React.useState(false);
  const [tab, setTab] = React.useState<"plans" | "custom">("plans");
  const [amount, setAmount] = React.useState(String(CHECK_PRICE));
  const [planId, setPlanId] = React.useState<string | null>(null);
  const [agreed, setAgreed] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  const canSubmit = agreed && (tab === "custom" ? Number(amount) >= CHECK_PRICE : Boolean(planId));

  const bdtPreview = Number(amount) > 0 ? Number(amount) * USD_TO_BDT_RATE : 0;

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
          : { amount: Number(amount), agreedToPolicies: agreed };
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
          setAmount(String(CHECK_PRICE));
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
                Standard rate: ${CHECK_PRICE.toFixed(2)}/check. Buy in bulk and the discount is
                credited straight to your wallet, at ${CHECK_PRICE.toFixed(2)}/check value, so the
                per-check price never changes, you just get more for less.
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
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{plan.label}</span>
                        <Badge variant="secondary" className="text-[0.7rem]">
                          {plan.discountPercent}% off
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {plan.checks} checks &middot; ${pricing.perCheck.toFixed(2)}/check
                      </p>
                      <p className="text-lg font-heading font-semibold">
                        ${pricing.price.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Credits ${pricing.faceValue.toFixed(2)} to your wallet
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
                <Label htmlFor="topup-amount">Amount (USD)</Label>
                <Input
                  id="topup-amount"
                  type="number"
                  min={CHECK_PRICE}
                  max="1000"
                  step="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-11"
                />
                <div className="flex flex-wrap gap-2">
                  {QUICK_AMOUNTS.map((a) => (
                    <Button
                      key={a}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setAmount(String(a))}
                    >
                      ${a}
                    </Button>
                  ))}
                </div>
                {bdtPreview > 0 && (
                  <p className="text-xs text-muted-foreground">
                    You&apos;ll be charged &#2547;{bdtPreview.toLocaleString()} BDT via SSLCommerz
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

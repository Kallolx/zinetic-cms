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
import { LuWallet, LuLoaderCircle } from "react-icons/lu";

const CHECK_PRICE = Number(process.env.NEXT_PUBLIC_CHECK_PRICE ?? 15);
const QUICK_AMOUNTS = [CHECK_PRICE, CHECK_PRICE * 2, CHECK_PRICE * 4, CHECK_PRICE * 8];
const USD_TO_BDT_RATE = Number(process.env.NEXT_PUBLIC_USD_TO_BDT_RATE ?? 120);

export function TopUpForm() {
  const [open, setOpen] = React.useState(false);
  const [amount, setAmount] = React.useState(String(CHECK_PRICE));
  const [agreed, setAgreed] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  const bdtPreview = Number(amount) > 0 ? Number(amount) * USD_TO_BDT_RATE : 0;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!agreed) {
      toast.error("Please confirm you agree to the policies first.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/payments/sslcommerz/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(amount), agreedToPolicies: agreed }),
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="gap-1.5">
            <LuWallet className="size-4" />
            Top up wallet
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>Top up your wallet</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
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
                  (&#2547;{USD_TO_BDT_RATE} = $1).
                </p>
              )}
            </div>

            <label className="flex items-start gap-2.5 text-sm">
              <Checkbox
                checked={agreed}
                onCheckedChange={(v) => setAgreed(v === true)}
                className="mt-0.5"
              />
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
          </div>

          <DialogFooter>
            <Button type="submit" disabled={submitting || !agreed} className="w-full gap-2">
              {submitting && <LuLoaderCircle className="size-4 animate-spin" />}
              Continue to payment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

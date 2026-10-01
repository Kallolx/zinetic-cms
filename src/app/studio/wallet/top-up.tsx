"use client";

import * as React from "react";
import Link from "next/link";
import { LuLoaderCircle, LuLock } from "react-icons/lu";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCredits } from "@/lib/credits";

const PRESETS = ["5", "10", "25", "50"];
const RATE = Number(process.env.NEXT_PUBLIC_USD_TO_BDT_RATE ?? 122);

/** Buy AI Studio credits. Its own flow: it only ever fills the Studio wallet. */
export function StudioTopUp() {
  const [usd, setUsd] = React.useState("10");
  const [agreed, setAgreed] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const amount = Number(usd);
  const valid = Number.isFinite(amount) && amount >= 5 && amount <= 500;

  async function pay() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/studio/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usd: amount, agreed }),
      });
      const json = (await res.json().catch(() => ({}))) as { gatewayPageUrl?: string; error?: string };
      if (!res.ok || !json.gatewayPageUrl) {
        setError(json.error ?? "Could not start the payment.");
        setBusy(false);
        return;
      }
      window.location.assign(json.gatewayPageUrl);
    } catch {
      setError("Could not reach the server.");
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 border-t pt-5">
      <div className="flex flex-col gap-2">
        <Label>Add credits</Label>
        <Tabs value={PRESETS.includes(usd) ? usd : ""} onValueChange={(v) => v && setUsd(v)}>
          <TabsList className="w-full">
            {PRESETS.map((p) => (
              <TabsTrigger key={p} value={p}>
                ${p}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="studio-usd">Or enter an amount in USD</Label>
        <Input id="studio-usd" type="number" min={5} max={500} step="1" value={usd} onChange={(e) => setUsd(e.target.value)} />
        <p className="text-xs text-muted-foreground">
          {valid ? (
            <>
              ${amount.toFixed(2)} gives you {formatCredits(amount)}. You pay ৳{Math.round(amount * RATE).toLocaleString()}.
            </>
          ) : (
            "Between $5 and $500."
          )}
        </p>
      </div>

      <label className="flex cursor-pointer items-start gap-2.5 text-xs leading-relaxed text-muted-foreground">
        <Checkbox checked={agreed} onCheckedChange={(v) => setAgreed(v === true)} className="mt-0.5" />
        <span>
          I agree to the{" "}
          <Link href="/terms" target="_blank" className="text-foreground underline underline-offset-4">
            Terms
          </Link>
          ,{" "}
          <Link href="/privacy" target="_blank" className="text-foreground underline underline-offset-4">
            Privacy Policy
          </Link>{" "}
          and{" "}
          <Link href="/refund-policy" target="_blank" className="text-foreground underline underline-offset-4">
            Refund Policy
          </Link>
          .
        </span>
      </label>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button size="lg" onClick={pay} disabled={busy || !agreed || !valid} className="w-full">
        {busy ? <LuLoaderCircle className="animate-spin" /> : <LuLock />}
        {busy ? "Opening secure payment" : "Pay with SSLCommerz"}
      </Button>
    </div>
  );
}

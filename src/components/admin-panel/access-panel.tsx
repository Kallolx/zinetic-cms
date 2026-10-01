"use client";

import * as React from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { LuAudioLines, LuDisc3, LuLoaderCircle, LuMinus, LuPlus, LuShieldCheck } from "react-icons/lu";
import { setUserProduct } from "@/app/actions/admin";
import { adjustCheckerCredits } from "@/app/actions/admin-panel";
import { formatCredits } from "@/lib/credits";
import { STUDIO_SERVICES, formatUnits, serviceName } from "@/lib/studio/services";
import type { EntitlementRow, ServiceStatus } from "@/lib/studio/entitlements";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { StudioServicesEditor } from "@/components/admin-panel/studio-services-editor";

type Tx = { id: string; type: string; amount: number; note: string | null; created_at: string };

function DashboardSwitch({ userId, product, initial, label }: { userId: string; product: "cms" | "studio" | "distribution"; initial: boolean; label: string }) {
  const router = useRouter();
  const [on, setOn] = React.useState(initial);
  const [pending, startTransition] = React.useTransition();

  function change(next: boolean) {
    setOn(next);
    startTransition(async () => {
      const res = await setUserProduct(userId, product, next);
      if (res.error) {
        setOn(!next);
        return void toast.error(res.error);
      }
      toast.success(next ? `${label} opened` : `${label} closed`);
      router.refresh();
    });
  }

  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm">
      <span className={on ? "font-medium" : "text-muted-foreground"}>{on ? "Open" : "Closed"}</span>
      <Switch checked={on} disabled={pending} onCheckedChange={change} aria-label={`${label} access`} />
    </label>
  );
}

function CheckerCredits({ userId, walletUsd, transactions }: { userId: string; walletUsd: number; transactions: Tx[] }) {
  const router = useRouter();
  const [credits, setCredits] = React.useState("");
  const [note, setNote] = React.useState("");
  const [busy, setBusy] = React.useState<"add" | "remove" | null>(null);

  async function apply(sign: 1 | -1) {
    const n = Math.abs(Number(credits));
    if (!n) return;
    setBusy(sign === 1 ? "add" : "remove");
    const res = await adjustCheckerCredits(userId, sign * n, note || undefined);
    setBusy(null);
    if (res.error) return void toast.error(res.error);
    toast.success(`${sign === 1 ? "Added" : "Removed"} ${n} ${n === 1 ? "credit" : "credits"}`);
    setCredits("");
    setNote("");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-sm text-muted-foreground">Checker credits</p>
        <p className="font-heading text-4xl font-semibold tabular-nums">{formatCredits(walletUsd)}</p>
      </div>
      <div className="flex flex-col gap-2">
        <Label>Add or remove credits</Label>
        <div className="flex flex-wrap gap-1.5">
          {[1, 5, 10, 25, 50].map((n) => (
            <Button key={n} type="button" variant={credits === String(n) ? "default" : "outline"} size="xs" onClick={() => setCredits(String(n))}>
              {n}
            </Button>
          ))}
        </div>
        <div className="grid gap-2 sm:grid-cols-[7rem_1fr]">
          <Input type="number" min={0} step="1" placeholder="Credits" value={credits} onChange={(e) => setCredits(e.target.value)} />
          <Input placeholder="Note (shown on their transactions)" value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <Button onClick={() => apply(1)} disabled={!Number(credits) || busy !== null}>
            {busy === "add" ? <LuLoaderCircle className="animate-spin" /> : <LuPlus />} Add credits
          </Button>
          <Button variant="outline" onClick={() => apply(-1)} disabled={!Number(credits) || busy !== null}>
            {busy === "remove" ? <LuLoaderCircle className="animate-spin" /> : <LuMinus />} Remove
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">No payment is taken. 1 credit is one channel check.</p>
      </div>
      {transactions.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <Label>Latest transactions</Label>
          <ul className="divide-y rounded-lg border text-sm">
            {transactions.slice(0, 5).map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-3 px-3 py-2">
                <span className="min-w-0 truncate text-muted-foreground">{t.note ?? t.type}</span>
                <span className={Number(t.amount) >= 0 ? "shrink-0 font-medium text-emerald-600 dark:text-emerald-400" : "shrink-0 font-medium"}>
                  {Number(t.amount) >= 0 ? "+" : ""}
                  {formatCredits(Number(t.amount))}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/** The three dashboards side by side: open or close each, and manage what is inside it. */
export function AccessPanel({
  userId,
  products,
  walletUsd,
  transactions,
  summary,
  entitlements,
}: {
  userId: string;
  products: string[];
  walletUsd: number;
  transactions: Tx[];
  summary: Record<string, ServiceStatus>;
  entitlements: EntitlementRow[];
}) {
  const has = (p: string) => products.includes(p);
  const activeServices = STUDIO_SERVICES.filter((s) => summary[s.id]?.active);

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <LuShieldCheck className="size-4.5 text-muted-foreground" /> Channel Checker
            </CardTitle>
            <DashboardSwitch userId={userId} product="cms" initial={has("cms")} label="Channel Checker" />
          </div>
          <CardDescription>The MCN and copyright checker. Runs on its own credits.</CardDescription>
        </CardHeader>
        <CardContent>
          <CheckerCredits userId={userId} walletUsd={walletUsd} transactions={transactions} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <LuAudioLines className="size-4.5 text-muted-foreground" /> AI Studio
            </CardTitle>
            <DashboardSwitch userId={userId} product="studio" initial={has("studio")} label="AI Studio" />
          </div>
          <CardDescription>
            {activeServices.length} of {STUDIO_SERVICES.length} services active. Each service is its own plan.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          {activeServices.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {activeServices.map((s) => (
                <Badge key={s.id} variant="secondary" className="font-normal">
                  {serviceName(s.id)} · {formatUnits(summary[s.id].remaining, summary[s.id].unit)} left
                </Badge>
              ))}
            </div>
          )}
          <StudioServicesEditor userId={userId} rows={entitlements} />
        </CardContent>
      </Card>

      <Card className="xl:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <LuDisc3 className="size-4.5 text-muted-foreground" /> Music Distribution
              <Badge variant="outline">Building</Badge>
            </CardTitle>
            <DashboardSwitch userId={userId} product="distribution" initial={has("distribution")} label="Music Distribution" />
          </div>
          <CardDescription>The dashboard is not open to customers yet. You can switch it on for someone early.</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

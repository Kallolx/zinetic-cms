"use client";

import * as React from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { LuTrash2 } from "react-icons/lu";
import { grantServiceAccess, revokeEntitlement } from "@/app/actions/admin";
import { STUDIO_SERVICES, formatUnits, serviceName } from "@/lib/studio/services";
import type { EntitlementRow } from "@/lib/studio/entitlements";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const live = (r: EntitlementRow) => (!r.expires_at || new Date(r.expires_at).getTime() > Date.now()) && r.quota - r.used > 0;

/** Which AI Studio services a customer can use, and how much of each. Grant or take away per service. */
export function ServiceAccessDialog({ userId, label, rows }: { userId: string; label: string; rows: EntitlementRow[] }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [service, setService] = React.useState(STUDIO_SERVICES[0].id);
  const [amount, setAmount] = React.useState("");
  const [days, setDays] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  const unit = STUDIO_SERVICES.find((s) => s.id === service)?.unit ?? "minutes";

  async function grant() {
    setBusy(true);
    const res = await grantServiceAccess(userId, service, Number(amount), days ? Number(days) : null);
    setBusy(false);
    if (res.error) return void toast.error(res.error);
    toast.success(`Granted ${formatUnits(Number(amount), unit)} of ${serviceName(service)}.`);
    setAmount("");
    router.refresh();
  }

  async function revoke(id: string) {
    const res = await revokeEntitlement(id);
    if (res.error) return void toast.error(res.error);
    router.refresh();
  }

  const active = new Set(rows.filter(live).map((r) => r.service)).size;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        Services <span className="ml-1 text-muted-foreground">{active}/{STUDIO_SERVICES.length}</span>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>AI Studio services</DialogTitle>
          <DialogDescription>{label}. Each service is separate, a customer only uses what they have bought or been granted.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          <Label>Grant a service</Label>
          <div className="grid gap-2 sm:grid-cols-[1fr_8rem_6rem_auto]">
            <select value={service} onChange={(e) => setService(e.target.value)} className="h-9 rounded-md border bg-background px-3 text-sm">
              {STUDIO_SERVICES.map((s) => (
                <option key={s.id} value={s.id}>
                  {serviceName(s.id)}
                </option>
              ))}
            </select>
            <Input type="number" min={0} placeholder={unit} value={amount} onChange={(e) => setAmount(e.target.value)} aria-label={`Amount in ${unit}`} />
            <Input type="number" min={0} placeholder="Days" value={days} onChange={(e) => setDays(e.target.value)} aria-label="Valid for days" />
            <Button onClick={grant} disabled={busy || !Number(amount)}>
              Grant
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Amount is in {unit}. Leave days empty for no expiry.</p>
        </div>

        <div className="flex flex-col gap-2">
          <Label>Current access</Label>
          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No services yet.</p>
          ) : (
            <ul className="divide-y rounded-lg border">
              {rows.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm">
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2 font-medium">
                      {serviceName(r.service)}
                      <Badge variant={live(r) ? "default" : "outline"}>{live(r) ? "Active" : "Finished"}</Badge>
                      <Badge variant="secondary">{r.source === "admin" ? "Granted" : "Bought"}</Badge>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {r.plan} · {formatUnits(r.quota - r.used, r.unit)} left of {formatUnits(r.quota, r.unit)}
                      {r.expires_at ? ` · until ${new Date(r.expires_at).toLocaleDateString()}` : ""}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon-sm" onClick={() => revoke(r.id)} aria-label="Remove">
                    <LuTrash2 />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

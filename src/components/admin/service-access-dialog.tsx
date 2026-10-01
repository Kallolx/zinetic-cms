"use client";

import * as React from "react";
import { STUDIO_SERVICES } from "@/lib/studio/services";
import type { EntitlementRow } from "@/lib/studio/entitlements";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { StudioServicesEditor } from "@/components/admin-panel/studio-services-editor";

const live = (r: EntitlementRow) => (!r.expires_at || new Date(r.expires_at).getTime() > Date.now()) && r.quota - r.used > 0;

/** Which AI Studio services a customer can use, in a window. The customer page shows the same editor inline. */
export function ServiceAccessDialog({ userId, label, rows }: { userId: string; label: string; rows: EntitlementRow[] }) {
  const active = new Set(rows.filter(live).map((r) => r.service)).size;
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        Services <span className="ml-1 text-muted-foreground">{active}/{STUDIO_SERVICES.length}</span>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>AI Studio services</DialogTitle>
          <DialogDescription>{label}. Each service is separate, a customer only uses what they have bought or been granted.</DialogDescription>
        </DialogHeader>
        <StudioServicesEditor userId={userId} rows={rows} />
      </DialogContent>
    </Dialog>
  );
}

"use client";

import * as React from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { LuCheck, LuX } from "react-icons/lu";
import { reviewUser } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";

/** Approve or reject a waiting sign-up without leaving the page. */
export function QuickReview({ userId, name }: { userId: string; name: string }) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();

  function decide(decision: "approved" | "rejected") {
    startTransition(async () => {
      const res = await reviewUser(userId, decision);
      if (res.error) return void toast.error(res.error);
      toast.success(decision === "approved" ? `${name} approved` : `${name} rejected`);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-1.5">
      <Button size="sm" onClick={() => decide("approved")} disabled={pending} aria-label={`Approve ${name}`}>
        <LuCheck /> Approve
      </Button>
      <Button size="icon-sm" variant="ghost" onClick={() => decide("rejected")} disabled={pending} aria-label={`Reject ${name}`}>
        <LuX />
      </Button>
    </div>
  );
}

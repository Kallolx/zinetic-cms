"use client";

import * as React from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  reviewUser,
  topUpWallet,
  deleteUser,
  impersonateUser,
  blockUser,
  unblockUser,
} from "@/app/actions/admin";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  LuCheck,
  LuX,
  LuWalletCards,
  LuLoaderCircle,
  LuTrash2,
  LuSearch,
  LuLogIn,
  LuShieldAlert,
  LuShieldCheck,
} from "react-icons/lu";
import { TablePagination } from "@/components/dashboard/table-pagination";
import { usePagination } from "@/hooks/use-pagination";
import { CHECK_PRICE, PRICING_PLANS, getPlanById, type PricingPlan } from "@/lib/pricing-plans";
import { formatCredits, creditsToUsd } from "@/lib/credits";
import type { Profile } from "@/lib/types";

const PAGE_SIZE = 15;

function StatusBadge({ status }: { status: Profile["status"] }) {
  if (status === "approved")
    return <Badge className="bg-emerald-600/10 text-emerald-700 dark:text-emerald-400">Approved</Badge>;
  if (status === "rejected") return <Badge variant="destructive">Rejected</Badge>;
  if (status === "blocked") return <Badge variant="destructive">Blocked</Badge>;
  return <Badge variant="secondary">Pending</Badge>;
}

export function TopUpDialog({ user }: { user: Profile }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [credits, setCredits] = React.useState("1");
  const [planId, setPlanId] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);

  function selectPlan(plan: PricingPlan) {
    setPlanId(plan.id);
    setCredits(String(plan.checks));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const creditsValue = Number(credits);
    if (!creditsValue || creditsValue <= 0) {
      toast.error("Enter a valid amount.");
      return;
    }
    const usdValue = creditsToUsd(creditsValue);
    const plan = planId ? getPlanById(planId) : undefined;
    const note = plan
      ? `${plan.label} plan (${plan.checks} Credits) granted by admin`
      : undefined;
    setPending(true);
    const result = await topUpWallet(user.id, usdValue, note);
    setPending(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(
      `Added ${formatCredits(usdValue)} to ${user.full_name ?? user.email}'s wallet.`
    );
    setOpen(false);
    setPlanId(null);
    router.refresh();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setPlanId(null);
          setCredits("1");
        }
      }}
    >
      <DialogTrigger
        render={
          <Button variant="outline" size="sm" className="gap-1.5">
            <LuWalletCards className="size-3.5" />
            Top up
          </Button>
        }
      />
      <DialogContent>
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>Top up wallet</DialogTitle>
            <DialogDescription>
              Credit {user.full_name ?? user.email}&apos;s wallet balance (current:{" "}
              {formatCredits(Number(user.wallet_balance))}).
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-4">
            <div className="flex flex-col gap-1.5">
              <Label>Grant a plan (optional)</Label>
              <div className="flex flex-wrap gap-1.5">
                {PRICING_PLANS.map((plan) => (
                  <Button
                    key={plan.id}
                    type="button"
                    size="sm"
                    variant={planId === plan.id ? "default" : "outline"}
                    onClick={() => selectPlan(plan)}
                    className="gap-1"
                  >
                    {plan.label}
                    <span className="text-xs opacity-70">{plan.checks} Credits</span>
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="credits">Credits</Label>
              <Input
                id="credits"
                type="number"
                min="1"
                step="1"
                value={credits}
                onChange={(e) => {
                  setCredits(e.target.value);
                  setPlanId(null);
                }}
              />
              <p className="text-xs text-muted-foreground">
                = {formatCredits(creditsToUsd(Number(credits) || 0))} (${CHECK_PRICE.toFixed(2)}
                /Credit). No charge to the user, this is a manual grant.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending} className="gap-2">
              {pending && <LuLoaderCircle className="size-4 animate-spin" />}
              Confirm top-up
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ImpersonateButton({ user }: { user: Profile }) {
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);

  async function onConfirm() {
    setPending(true);
    const result = await impersonateUser(user.id);
    setPending(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    setOpen(false);
    window.open("/dashboard", "_blank", "noopener,noreferrer");
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button variant="outline" size="sm" className="gap-1.5">
            <LuLogIn className="size-3.5" />
            Impersonate
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>View as {user.full_name ?? user.email}?</AlertDialogTitle>
          <AlertDialogDescription>
            Opens their dashboard in a new tab, without needing their password. Your admin
            session stays fully signed in the whole time, in this tab and every other one.
            Any action you take there (checks, wallet spend) affects their real account.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction disabled={pending} onClick={onConfirm} className="gap-2">
            {pending && <LuLoaderCircle className="size-4 animate-spin" />}
            Open their dashboard
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function BlockUserDialog({ user }: { user: Profile }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [reason, setReason] = React.useState("");
  const [pending, setPending] = React.useState(false);

  async function onConfirm() {
    setPending(true);
    const result = await blockUser(user.id, reason);
    setPending(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(`Blocked ${user.full_name ?? user.email}.`);
    setOpen(false);
    setReason("");
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm" className="gap-1.5 text-destructive hover:bg-destructive/10">
            <LuShieldAlert className="size-3.5" />
            Block
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Block {user.full_name ?? user.email}?</DialogTitle>
          <DialogDescription>
            They&apos;ll be signed out and permanently locked out of their account. They&apos;ll
            see a message saying their account was blocked for a Terms of Service violation, with
            no way back in except contacting support. This can be reversed later from Unblock.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2 py-2">
          <Label htmlFor="block-reason">Internal reason (optional, not shown to the user)</Label>
          <Input
            id="block-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. abusive checks, chargeback fraud"
          />
        </div>
        <DialogFooter>
          <Button
            variant="destructive"
            disabled={pending}
            onClick={onConfirm}
            className="gap-2"
          >
            {pending && <LuLoaderCircle className="size-4 animate-spin" />}
            Block user
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function UnblockButton({ user }: { user: Profile }) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  async function onClick() {
    setPending(true);
    const result = await unblockUser(user.id);
    setPending(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(`Unblocked ${user.full_name ?? user.email}.`);
    router.refresh();
  }

  return (
    <Button size="sm" variant="outline" className="gap-1.5" disabled={pending} onClick={onClick}>
      {pending ? <LuLoaderCircle className="size-3.5 animate-spin" /> : <LuShieldCheck className="size-3.5" />}
      Unblock
    </Button>
  );
}

function DeleteUserDialog({ user }: { user: Profile }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);

  async function onConfirm() {
    setPending(true);
    const result = await deleteUser(user.id);
    setPending(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(`Deleted ${user.full_name ?? user.email}.`);
    setOpen(false);
    router.refresh();
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button variant="outline" size="icon-sm" className="text-destructive hover:bg-destructive/10">
            <LuTrash2 className="size-3.5" />
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this user?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently deletes {user.full_name ?? user.email}&apos;s account, wallet
            history, and check history. This can&apos;t be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={pending}
            onClick={onConfirm}
            className="gap-2"
          >
            {pending && <LuLoaderCircle className="size-4 animate-spin" />}
            Delete user
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function UsersTable({
  users,
  compact = false,
  showStatusActions = true,
  searchable = false,
}: {
  users: Profile[];
  compact?: boolean;
  /** Show approve/reject/top-up/reinstate inline. Turn off on pages that
   *  already have a dedicated page for that action (Approvals, Top Up). */
  showStatusActions?: boolean;
  searchable?: boolean;
}) {
  const router = useRouter();
  const [pendingId, setPendingId] = React.useState<string | null>(null);
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    if (!query.trim()) return users;
    const q = query.toLowerCase();
    return users.filter(
      (u) => u.full_name?.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  }, [users, query]);

  const { page, setPage, pageCount, pageItems } = usePagination(filtered, PAGE_SIZE);

  async function onReview(userId: string, decision: "approved" | "rejected") {
    setPendingId(userId);
    const result = await reviewUser(userId, decision);
    setPendingId(null);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(decision === "approved" ? "User approved." : "User rejected.");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      {searchable && (
        <div className="relative max-w-sm">
          <LuSearch className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or email..."
            className="pl-9"
          />
        </div>
      )}
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            {!compact && <TableHead className="text-right">Wallet</TableHead>}
            <TableHead>Joined</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pageItems.map((u) => (
            <TableRow key={u.id}>
              <TableCell className="font-medium">{u.full_name ?? "N/A"}</TableCell>
              <TableCell className="text-muted-foreground">{u.email}</TableCell>
              <TableCell>
                <StatusBadge status={u.status} />
              </TableCell>
              {!compact && (
                <TableCell className="text-right">
                  {formatCredits(Number(u.wallet_balance))}
                </TableCell>
              )}
              <TableCell className="text-muted-foreground">
                {new Date(u.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-2">
                  {showStatusActions && u.status === "pending" && (
                    <>
                      <Button
                        size="sm"
                        className="gap-1.5"
                        disabled={pendingId === u.id}
                        onClick={() => onReview(u.id, "approved")}
                      >
                        <LuCheck className="size-3.5" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5"
                        disabled={pendingId === u.id}
                        onClick={() => onReview(u.id, "rejected")}
                      >
                        <LuX className="size-3.5" />
                        Reject
                      </Button>
                    </>
                  )}
                  {showStatusActions && u.status === "approved" && <TopUpDialog user={u} />}
                  {u.status === "approved" && <ImpersonateButton user={u} />}
                  {u.status === "approved" && <BlockUserDialog user={u} />}
                  {u.status === "blocked" && <UnblockButton user={u} />}
                  {showStatusActions && u.status === "rejected" && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={pendingId === u.id}
                      onClick={() => onReview(u.id, "approved")}
                    >
                      Reinstate
                    </Button>
                  )}
                  <DeleteUserDialog user={u} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
      <TablePagination page={page} pageCount={pageCount} onPageChange={setPage} />
    </div>
  );
}

"use client";

import * as React from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { reviewUser, topUpWallet, deleteUser } from "@/app/actions/admin";
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
import { LuCheck, LuX, LuWalletCards, LuLoaderCircle, LuTrash2 } from "react-icons/lu";
import type { Profile } from "@/lib/types";

function StatusBadge({ status }: { status: Profile["status"] }) {
  if (status === "approved")
    return <Badge className="bg-emerald-600/10 text-emerald-700 dark:text-emerald-400">Approved</Badge>;
  if (status === "rejected") return <Badge variant="destructive">Rejected</Badge>;
  return <Badge variant="secondary">Pending</Badge>;
}

function TopUpDialog({ user }: { user: Profile }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [amount, setAmount] = React.useState("15");
  const [pending, setPending] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = Number(amount);
    if (!value || value <= 0) {
      toast.error("Enter a valid amount.");
      return;
    }
    setPending(true);
    const result = await topUpWallet(user.id, value);
    setPending(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(`Added $${value.toFixed(2)} to ${user.full_name ?? user.email}'s wallet.`);
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
              Credit {user.full_name ?? user.email}&apos;s wallet balance (current: $
              {Number(user.wallet_balance).toFixed(2)}).
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 py-4">
            <Label htmlFor="amount">Amount (USD)</Label>
            <Input
              id="amount"
              type="number"
              min="1"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
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
}: {
  users: Profile[];
  compact?: boolean;
}) {
  const router = useRouter();
  const [pendingId, setPendingId] = React.useState<string | null>(null);

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
          {users.map((u) => (
            <TableRow key={u.id}>
              <TableCell className="font-medium">{u.full_name ?? "N/A"}</TableCell>
              <TableCell className="text-muted-foreground">{u.email}</TableCell>
              <TableCell>
                <StatusBadge status={u.status} />
              </TableCell>
              {!compact && (
                <TableCell className="text-right">
                  ${Number(u.wallet_balance).toFixed(2)}
                </TableCell>
              )}
              <TableCell className="text-muted-foreground">
                {new Date(u.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-2">
                  {u.status === "pending" && (
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
                  {u.status === "approved" && <TopUpDialog user={u} />}
                  {u.status === "rejected" && (
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
  );
}

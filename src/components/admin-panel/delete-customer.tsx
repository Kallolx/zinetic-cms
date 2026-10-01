"use client";

import * as React from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { LuLoaderCircle, LuTrash2 } from "react-icons/lu";
import { deleteUser } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

/**
 * Deletes a customer completely. To avoid a slip, the admin has to type the customer's email.
 * It removes the sign-in, profile, wallet history, checks, AI Studio plans and every file they made.
 * Payment records are kept for your accounts, but no longer point at a person.
 */
export function DeleteCustomerDialog({
  id,
  name,
  email,
  variant = "button",
  redirectTo,
}: {
  id: string;
  name: string;
  email: string;
  variant?: "button" | "icon";
  /** where to go afterwards, when deleting from the customer's own page */
  redirectTo?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [typed, setTyped] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const matches = typed.trim().toLowerCase() === email.toLowerCase();

  async function remove() {
    setBusy(true);
    const res = await deleteUser(id);
    setBusy(false);
    if (res.error) return void toast.error(res.error);
    toast.success(`${name} deleted`);
    setOpen(false);
    if (redirectTo) router.push(redirectTo);
    else router.refresh();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setTyped("");
      }}
    >
      <DialogTrigger
        render={
          variant === "icon" ? (
            <Button variant="ghost" size="icon-sm" aria-label={`Delete ${name}`} className="text-muted-foreground hover:text-destructive" />
          ) : (
            <Button variant="outline" className="text-destructive hover:text-destructive" />
          )
        }
      >
        <LuTrash2 />
        {variant === "button" && "Delete"}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete {name} for good?</DialogTitle>
          <DialogDescription>
            This removes their sign-in, profile, wallet history, channel checks, AI Studio plans and every file they made. It cannot be undone. Their payments stay in your records for accounting.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <p className="text-sm">
            Type <b className="font-medium">{email}</b> to confirm.
          </p>
          <Input value={typed} onChange={(e) => setTyped(e.target.value)} placeholder={email} autoComplete="off" />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={busy}>
            Keep customer
          </Button>
          <Button variant="destructive" onClick={remove} disabled={!matches || busy}>
            {busy ? <LuLoaderCircle className="animate-spin" /> : <LuTrash2 />} Delete everything
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

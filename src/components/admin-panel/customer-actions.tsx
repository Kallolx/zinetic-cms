"use client";

import * as React from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { LuBan, LuCheck, LuLoaderCircle, LuX } from "react-icons/lu";
import { blockUser, reviewUser, unblockUser } from "@/app/actions/admin";
import { setAdminNote } from "@/app/actions/admin-panel";
import { ImpersonateButton } from "@/components/admin/users-table";
import { DeleteCustomerDialog } from "@/components/admin-panel/delete-customer";
import type { Profile } from "@/lib/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

/** The buttons at the top of a customer: approve, reject, block, sign in as them. */
export function CustomerActions({ user }: { user: Profile }) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  const [reason, setReason] = React.useState("");
  const name = user.full_name || user.email;

  function run(fn: () => Promise<{ error: string | null }>, ok: string) {
    startTransition(async () => {
      const res = await fn();
      if (res.error) return void toast.error(res.error);
      toast.success(ok);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {user.status === "pending" && (
        <>
          <Button onClick={() => run(() => reviewUser(user.id, "approved"), `${name} approved`)} disabled={pending}>
            {pending ? <LuLoaderCircle className="animate-spin" /> : <LuCheck />} Approve
          </Button>
          <Button variant="outline" onClick={() => run(() => reviewUser(user.id, "rejected"), `${name} rejected`)} disabled={pending}>
            <LuX /> Reject
          </Button>
        </>
      )}
      {user.status === "rejected" && (
        <Button onClick={() => run(() => reviewUser(user.id, "approved"), `${name} approved`)} disabled={pending}>
          <LuCheck /> Approve
        </Button>
      )}
      {user.status === "approved" && <ImpersonateButton user={user} />}

      {user.status === "blocked" ? (
        <Button variant="outline" onClick={() => run(() => unblockUser(user.id), `${name} unblocked`)} disabled={pending}>
          Unblock
        </Button>
      ) : (
        user.status !== "pending" && (
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button variant="outline">
                  <LuBan /> Block
                </Button>
              }
            />
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Block {name}?</AlertDialogTitle>
                <AlertDialogDescription>They will be signed out of every dashboard and cannot sign in again until you unblock them.</AlertDialogDescription>
              </AlertDialogHeader>
              <Input placeholder="Reason (kept in the audit log)" value={reason} onChange={(e) => setReason(e.target.value)} />
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => run(() => blockUser(user.id, reason), `${name} blocked`)}>Block</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )
      )}
      <DeleteCustomerDialog id={user.id} name={name} email={user.email} redirectTo="/admin/customers" />
    </div>
  );
}

/** A private note only admins can see, and the account's danger zone. */
export function CustomerNotes({ user }: { user: Profile }) {
  const router = useRouter();
  const [note, setNote] = React.useState(user.admin_note ?? "");
  const [saving, startTransition] = React.useTransition();
  const dirty = note.trim() !== (user.admin_note ?? "").trim();

  function save() {
    startTransition(async () => {
      const res = await setAdminNote(user.id, note);
      if (res.error) return void toast.error(res.error);
      toast.success("Note saved");
      router.refresh();
    });
  }

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Private note</CardTitle>
          <CardDescription>Only admins see this. Use it for context, such as who they are or a promise you made.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={5} placeholder="Nothing written yet." />
          <div>
            <Button onClick={save} disabled={!dirty || saving}>
              {saving && <LuLoaderCircle className="animate-spin" />} Save note
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-base text-destructive">Danger zone</CardTitle>
          <CardDescription>Deleting removes the account, their wallet history and their checks for good. This cannot be undone.</CardDescription>
        </CardHeader>
        <CardContent>
          <DeleteCustomerDialog id={user.id} name={user.full_name || user.email} email={user.email} redirectTo="/admin/customers" />
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PasswordInput } from "@/components/password-input";
import { LuLoaderCircle, LuTriangleAlert, LuArrowRight } from "react-icons/lu";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const password = String(formData.get("password") ?? "");
    const confirm = String(formData.get("confirm") ?? "");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setPending(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setPending(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    router.push("/login");
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-bold">Set a new password</h1>
        <p className="text-[0.95rem] text-muted-foreground">
          Choose a new password for your account.
        </p>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        {error && (
          <Alert variant="destructive">
            <LuTriangleAlert className="size-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="flex flex-col gap-2">
          <Label htmlFor="password">New password</Label>
          <PasswordInput
            id="password"
            name="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="h-12 text-base"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="confirm">Confirm password</Label>
          <PasswordInput
            id="confirm"
            name="confirm"
            required
            minLength={8}
            autoComplete="new-password"
            className="h-12 text-base"
          />
        </div>

        <Button type="submit" size="lg" className="mt-2 w-full gap-2" disabled={pending}>
          {pending ? (
            <LuLoaderCircle className="size-4 animate-spin" />
          ) : (
            <LuArrowRight className="size-4" />
          )}
          Update password
        </Button>
      </form>
    </div>
  );
}

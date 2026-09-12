"use client";

import * as React from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LuLoaderCircle, LuTriangleAlert, LuArrowRight, LuMailCheck, LuArrowLeft } from "react-icons/lu";

export default function ForgotPasswordPage() {
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [sent, setSent] = React.useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const formData = new FormData(e.currentTarget);
    const result = await requestPasswordReset(formData);
    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="flex w-full max-w-sm flex-col items-center gap-4 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <LuMailCheck className="size-7" />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-2xl font-bold">Check your email</h1>
          <p className="text-[0.925rem] text-muted-foreground">
            If an account exists for that email, we&apos;ve sent a link to reset your password.
          </p>
        </div>
        <Link href="/login" className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
          <LuArrowLeft className="size-4" />
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-bold">Forgot password?</h1>
        <p className="text-[0.95rem] text-muted-foreground">
          Enter your email and we&apos;ll send you a reset link.
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
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            autoComplete="email"
            className="h-12 text-base"
          />
        </div>

        <Button type="submit" size="lg" className="mt-2 w-full gap-2" disabled={pending}>
          {pending ? (
            <LuLoaderCircle className="size-4 animate-spin" />
          ) : (
            <LuArrowRight className="size-4" />
          )}
          Send reset link
        </Button>
      </form>

      <div className="mt-6 text-center text-sm">
        <Link href="/login" className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline">
          <LuArrowLeft className="size-4" />
          Back to login
        </Link>
      </div>
    </div>
  );
}

"use client";

import * as React from "react";
import Link from "next/link";
import { signIn } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LuLoaderCircle, LuTriangleAlert, LuArrowRight } from "react-icons/lu";
import { SocialAuthRow } from "@/components/social-auth-row";
import { PasswordInput } from "@/components/password-input";

export default function LoginPage() {
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const formData = new FormData(e.currentTarget);
    try {
      const result = await signIn(formData);
      if (result?.error) {
        setError(result.error);
        setPending(false);
      }
    } catch (err) {
      // NEXT_REDIRECT throws by design on success, let it propagate
      if (err instanceof Error && err.message === "NEXT_REDIRECT") throw err;
      setError("Something went wrong. Please try again.");
      setPending(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-bold">Welcome back</h1>
        <p className="text-[0.95rem] text-muted-foreground">
          Sign in to your Zinetic Music dashboard.
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
        <div className="flex flex-col gap-2">
          <Label htmlFor="password">Password</Label>
          <PasswordInput
            id="password"
            name="password"
            required
            autoComplete="current-password"
            className="h-12 text-base"
          />
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-muted-foreground select-none cursor-pointer">
            <Checkbox name="rememberMe" defaultChecked />
            Remember me
          </label>
          <Link
            href="/forgot-password"
            className="font-medium text-primary hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" size="lg" className="mt-2 w-full gap-2" disabled={pending}>
          {pending ? (
            <LuLoaderCircle className="size-4 animate-spin" />
          ) : (
            <LuArrowRight className="size-4" />
          )}
          Sign in
        </Button>
      </form>

      <div className="mt-5">
        <SocialAuthRow />
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
}

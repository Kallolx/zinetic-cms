import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LuSearch, LuMail, LuFileSpreadsheet, LuShieldCheck } from "react-icons/lu";

const features = [
  {
    icon: LuSearch,
    title: "MCN lookup",
    description: "Find out which network any YouTube channel belongs to in seconds.",
  },
  {
    icon: LuMail,
    title: "Contact email",
    description: "Get the network's contact email to reach out directly.",
  },
  {
    icon: LuFileSpreadsheet,
    title: "Check history",
    description: "Every check is saved so you can revisit results anytime.",
  },
  {
    icon: LuShieldCheck,
    title: "Copyright & claims",
    description: "Manage claims, revenue, and permissions for your channels.",
  },
];

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-6 py-5">
        <Logo />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            nativeButton={false}
            render={<Link href="/login">Sign in</Link>}
          />
          <Button nativeButton={false} render={<Link href="/register">Get started</Link>} />
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-10 px-4 py-16 text-center">
        <div className="flex max-w-2xl flex-col items-center gap-5">
          <h1 className="font-heading text-4xl font-extrabold tracking-tight sm:text-5xl">
            YouTube MCN Checker
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            Instantly see which network a YouTube channel belongs to and get the
            network&apos;s contact email, plus copyright and claim management, all in one
            dashboard.
          </p>
          <div className="flex items-center gap-3">
            <Button
              size="lg"
              nativeButton={false}
              render={<Link href="/register">Create an account</Link>}
            />
            <Button
              size="lg"
              variant="outline"
              nativeButton={false}
              render={<Link href="/login">Sign in</Link>}
            />
          </div>
        </div>

        <div className="grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <Card key={f.title} className="text-left">
              <CardHeader>
                <f.icon className="size-6 text-primary" />
                <CardTitle className="text-base">{f.title}</CardTitle>
                <CardDescription>{f.description}</CardDescription>
              </CardHeader>
              <CardContent />
            </Card>
          ))}
        </div>
      </main>

      <footer className="px-6 py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Zinetic Music. All rights reserved.
      </footer>
    </div>
  );
}

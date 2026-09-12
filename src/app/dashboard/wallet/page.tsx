import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getDashboardSession } from "@/lib/supabase/dashboard-session";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TransactionsTable } from "@/components/dashboard/transactions-table";
import { TopUpForm } from "@/components/dashboard/topup-form";
import { LuWallet, LuMail, LuCircleCheck, LuCircleX, LuClock } from "react-icons/lu";

export default async function WalletPage({
  searchParams,
}: {
  searchParams: Promise<{ payment?: string }>;
}) {
  const { user, profile } = await getDashboardSession();
  if (!user) redirect("/login");

  const { payment } = await searchParams;

  const supabase = createAdminClient();
  const { data: transactions } = await supabase
    .from("wallet_transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="flex flex-col gap-6">
      {payment === "success" && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-600/30 bg-emerald-600/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400">
          <LuCircleCheck className="size-4 shrink-0" />
          Payment received. Your wallet has been credited, this can take a few moments to
          reflect if it hasn&apos;t already.
        </div>
      )}
      {payment === "failed" && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <LuCircleX className="size-4 shrink-0" />
          Payment failed. No amount was charged. Please try again.
        </div>
      )}
      {payment === "cancelled" && (
        <div className="flex items-center gap-2 rounded-lg border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          <LuClock className="size-4 shrink-0" />
          Payment cancelled.
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardDescription className="flex items-center gap-1.5">
              <LuWallet className="size-4" /> Current balance
            </CardDescription>
            <CardTitle className="font-heading text-4xl">
              ${Number(profile?.wallet_balance ?? 0).toFixed(2)}
            </CardTitle>
          </div>
          <TopUpForm />
        </CardHeader>
        <CardContent>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <LuMail className="size-4" />
            Top up instantly above, or contact an admin at{" "}
            <a
              href="mailto:support@zineticmusic.com"
              className="text-primary underline underline-offset-4"
            >
              support@zineticmusic.com
            </a>
            .
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transaction history</CardTitle>
          <CardDescription>Top-ups, checks, and adjustments.</CardDescription>
        </CardHeader>
        <CardContent>
          {!transactions || transactions.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No transactions yet.
            </p>
          ) : (
            <TransactionsTable transactions={transactions} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

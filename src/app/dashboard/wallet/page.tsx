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
import { LuWallet, LuMail } from "react-icons/lu";

export default async function WalletPage() {
  const { user, profile } = await getDashboardSession();
  if (!user) redirect("/login");

  const supabase = createAdminClient();
  const { data: transactions } = await supabase
    .from("wallet_transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardDescription className="flex items-center gap-1.5">
            <LuWallet className="size-4" /> Current balance
          </CardDescription>
          <CardTitle className="font-heading text-4xl">
            ${Number(profile?.wallet_balance ?? 0).toFixed(2)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <LuMail className="size-4" />
            To top up your wallet, contact an admin at{" "}
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

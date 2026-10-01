import { getDashboardSession } from "@/lib/supabase/dashboard-session";
import { createClient } from "@/lib/supabase/server";
import { formatCredits } from "@/lib/credits";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StudioTopUp } from "./top-up";

type Tx = { id: string; type: string; amount: number; note: string | null; created_at: string };

const LABEL: Record<string, string> = { topup: "Top-up", studio_charge: "Used", refund: "Refund", adjustment: "Adjustment" };

export default async function StudioWalletPage({ searchParams }: { searchParams: Promise<{ payment?: string }> }) {
  const { user, profile } = await getDashboardSession();
  const { payment } = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase
    .from("wallet_transactions")
    .select("id, type, amount, note, created_at")
    .eq("user_id", user!.id)
    .eq("wallet", "studio")
    .order("created_at", { ascending: false })
    .limit(100);
  const rows = (data ?? []) as Tx[];
  const balance = Number(profile?.studio_balance ?? 0);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Wallet</h1>
        <p className="mt-1 text-sm text-muted-foreground">Credits for AI Studio. This is separate from your Channel Checker wallet.</p>
      </div>

      {payment === "success" && (
        <Alert>
          <AlertDescription>Payment received. Your credits are added, this can take a moment to show if it has not already.</AlertDescription>
        </Alert>
      )}
      {payment === "failed" && (
        <Alert variant="destructive">
          <AlertDescription>The payment did not go through and you were not charged. Please try again.</AlertDescription>
        </Alert>
      )}
      {payment === "cancelled" && (
        <Alert>
          <AlertDescription>Payment cancelled. Nothing was charged.</AlertDescription>
        </Alert>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardDescription>Studio balance</CardDescription>
            <CardTitle className="font-heading text-4xl">{formatCredits(balance)}</CardTitle>
            <CardDescription>${balance.toFixed(2)} in value</CardDescription>
          </CardHeader>
          <CardContent>
            <StudioTopUp />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {rows.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No transactions yet.</p>
            ) : (
              <ul className="divide-y">
                {rows.map((t) => (
                  <li key={t.id} className="flex items-center justify-between gap-4 py-3">
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 text-sm font-medium">
                        <Badge variant={t.amount >= 0 ? "default" : "secondary"}>{LABEL[t.type] ?? t.type}</Badge>
                        <span className="truncate font-normal text-muted-foreground">{t.note}</span>
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">{new Date(t.created_at).toLocaleString()}</p>
                    </div>
                    <span className={t.amount >= 0 ? "shrink-0 text-sm font-medium text-emerald-500" : "shrink-0 text-sm font-medium"}>
                      {t.amount >= 0 ? "+" : ""}
                      {formatCredits(t.amount)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

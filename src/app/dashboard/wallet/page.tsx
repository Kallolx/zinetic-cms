import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/supabase/session";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LuWallet, LuMail } from "react-icons/lu";

const typeLabel: Record<string, string> = {
  topup: "Top-up",
  check_charge: "MCN check",
  refund: "Refund",
  adjustment: "Adjustment",
};

export default async function WalletPage() {
  const { user, profile } = await getSessionProfile();
  if (!user) redirect("/login");

  const supabase = await createClient();
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
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Note</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell>
                        <Badge variant="secondary">{typeLabel[t.type] ?? t.type}</Badge>
                      </TableCell>
                      <TableCell className="max-w-[280px] truncate text-muted-foreground">
                        {t.note ?? "N/A"}
                      </TableCell>
                      <TableCell
                        className={`text-right font-medium ${
                          Number(t.amount) >= 0 ? "text-emerald-600" : "text-destructive"
                        }`}
                      >
                        {Number(t.amount) >= 0 ? "+" : ""}
                        {Number(t.amount).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {new Date(t.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

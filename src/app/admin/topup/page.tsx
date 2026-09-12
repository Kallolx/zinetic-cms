import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TopUpUsersTable } from "@/components/admin/topup-users-table";
import { TopupHistoryTable } from "@/components/admin/topup-history-table";

export default async function AdminTopUpPage() {
  const supabase = await createClient();

  const [{ data: users }, { data: history }] = await Promise.all([
    supabase
      .from("profiles")
      .select("*")
      .eq("role", "user")
      .eq("status", "approved")
      .order("full_name", { ascending: true }),
    supabase
      .from("wallet_transactions")
      .select("id, amount, note, created_at, profiles:user_id(full_name, email)")
      .eq("type", "topup")
      .order("created_at", { ascending: false })
      .limit(500),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Top Up</CardTitle>
          <CardDescription>
            Credit an approved user&apos;s wallet, or review every top-up ever made.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="users">
            <TabsList>
              <TabsTrigger value="users">Approved users</TabsTrigger>
              <TabsTrigger value="history">Top-up history</TabsTrigger>
            </TabsList>
            <TabsContent value="users" className="pt-4">
              {!users || users.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No approved users yet.
                </p>
              ) : (
                <TopUpUsersTable users={users} />
              )}
            </TabsContent>
            <TabsContent value="history" className="pt-4">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <TopupHistoryTable rows={(history as any) ?? []} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

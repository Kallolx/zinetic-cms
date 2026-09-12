import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { UsersTable } from "@/components/admin/users-table";

export default async function AdminApprovalsPage() {
  const supabase = await createClient();
  const { data: users } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "user")
    .order("created_at", { ascending: false });

  const all = users ?? [];
  const pending = all.filter((u) => u.status === "pending");
  const rejected = all.filter((u) => u.status === "rejected");

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Approvals</CardTitle>
          <CardDescription>Review new sign-ups and manage rejected accounts.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending">
            <TabsList>
              <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
              <TabsTrigger value="rejected">Rejected ({rejected.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="pending" className="pt-4">
              {pending.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No pending registrations. All caught up.
                </p>
              ) : (
                <UsersTable users={pending} />
              )}
            </TabsContent>
            <TabsContent value="rejected" className="pt-4">
              {rejected.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No rejected users.
                </p>
              ) : (
                <UsersTable users={rejected} />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

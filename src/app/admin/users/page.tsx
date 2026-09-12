import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { UsersTable } from "@/components/admin/users-table";

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const { data: users } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "user")
    .order("created_at", { ascending: false });

  const all = users ?? [];
  const pending = all.filter((u) => u.status === "pending");
  const approved = all.filter((u) => u.status === "approved");
  const rejected = all.filter((u) => u.status === "rejected");

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Users & Approvals</CardTitle>
          <CardDescription>
            Review registrations and manage wallet balances for approved users.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending">
            <TabsList>
              <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
              <TabsTrigger value="approved">Approved ({approved.length})</TabsTrigger>
              <TabsTrigger value="rejected">Rejected ({rejected.length})</TabsTrigger>
              <TabsTrigger value="all">All ({all.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="pending" className="pt-4">
              {pending.length === 0 ? (
                <EmptyState label="No pending registrations." />
              ) : (
                <UsersTable users={pending} />
              )}
            </TabsContent>
            <TabsContent value="approved" className="pt-4">
              {approved.length === 0 ? (
                <EmptyState label="No approved users yet." />
              ) : (
                <UsersTable users={approved} />
              )}
            </TabsContent>
            <TabsContent value="rejected" className="pt-4">
              {rejected.length === 0 ? (
                <EmptyState label="No rejected users." />
              ) : (
                <UsersTable users={rejected} />
              )}
            </TabsContent>
            <TabsContent value="all" className="pt-4">
              {all.length === 0 ? (
                <EmptyState label="No users yet." />
              ) : (
                <UsersTable users={all} />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return <p className="py-8 text-center text-sm text-muted-foreground">{label}</p>;
}

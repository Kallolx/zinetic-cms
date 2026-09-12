import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChecksTable } from "@/components/admin/checks-table";

export default async function AdminChecksPage() {
  const supabase = await createClient();
  const { data: checks } = await supabase
    .from("mcn_checks")
    .select("*, profiles:user_id(full_name, email)")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>All checks</CardTitle>
          <CardDescription>Every MCN check run across all users.</CardDescription>
        </CardHeader>
        <CardContent>
          {!checks || checks.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No checks yet.</p>
          ) : (
            <ChecksTable checks={checks} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

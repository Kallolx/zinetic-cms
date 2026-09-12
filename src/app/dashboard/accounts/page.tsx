import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/supabase/session";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function AccountsPage() {
  const { user, profile } = await getSessionProfile();
  if (!user) redirect("/login");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-heading text-2xl font-semibold">Account</h2>
        <p className="text-[0.925rem] text-muted-foreground">
          Your account details and membership status.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
          <CardDescription>Contact support to update these details.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm">
          <Row label="Full name" value={profile?.full_name ?? "N/A"} />
          <Row label="Email" value={user.email ?? "N/A"} />
          <Row
            label="Status"
            value={<Badge className="bg-emerald-600/10 text-emerald-700 dark:text-emerald-400">Approved</Badge>}
          />
          <Row
            label="Member since"
            value={
              profile?.created_at
                ? new Date(profile.created_at).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })
                : "N/A"
            }
          />
          <Row label="Wallet balance" value={`$${Number(profile?.wallet_balance ?? 0).toFixed(2)}`} />
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b pb-3 last:border-0 last:pb-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="truncate font-medium">{value}</span>
    </div>
  );
}

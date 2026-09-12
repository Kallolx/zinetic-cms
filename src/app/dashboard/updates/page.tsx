import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const updates = [
  {
    date: "2026-09-11",
    tag: "New",
    title: "Copyright channel tracker",
    description:
      "Check any YouTube channel's MCN and contact email, and keep a running list with export to Excel.",
  },
  {
    date: "2026-09-11",
    tag: "New",
    title: "Wallet & transactions",
    description: "Track every check charge and top-up in one place.",
  },
];

export default function UpdatesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-heading text-2xl font-semibold">Updates</h2>
        <p className="text-[0.925rem] text-muted-foreground">
          What&apos;s new on the Zinetic Music dashboard.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {updates.map((u) => (
          <Card key={u.title}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Badge>{u.tag}</Badge>
                <CardDescription>
                  {new Date(u.date).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </CardDescription>
              </div>
              <CardTitle className="text-base">{u.title}</CardTitle>
              <CardDescription>{u.description}</CardDescription>
            </CardHeader>
            <CardContent />
          </Card>
        ))}
      </div>
    </div>
  );
}

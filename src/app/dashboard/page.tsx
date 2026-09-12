import { ChannelsPageClient } from "@/components/dashboard/channels-page-client";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-heading text-2xl font-semibold">Copyright</h2>
        <p className="text-[0.925rem] text-muted-foreground">
          Track which network each of your channels belongs to.
        </p>
      </div>

      <ChannelsPageClient initialQuery={q ?? ""} />
    </div>
  );
}

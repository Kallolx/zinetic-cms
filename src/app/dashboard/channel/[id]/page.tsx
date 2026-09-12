import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/supabase/session";
import { ExpandableText } from "@/components/dashboard/expandable-text";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LuUsers,
  LuEye,
  LuVideo,
  LuMail,
  LuArrowLeft,
  LuCircleCheck,
  LuCircleAlert,
  LuDollarSign,
  LuUndo2,
} from "react-icons/lu";

type MockVideo = {
  title: string;
  views: number;
  published_at: string;
  claim_status: "claimed" | "clear";
};

type MockReports = {
  monthly_views: number;
  estimated_revenue_usd: number;
  claims_this_month: number;
  released_claims: number;
};

type RawResponse = {
  custom_url?: string;
  description?: string;
  country_code?: string;
  language?: string;
  date_of_creation?: string;
  videos?: MockVideo[];
  reports?: MockReports;
};

function fmt(n: number | null | undefined) {
  if (n === null || n === undefined) return "N/A";
  return new Intl.NumberFormat("en-US", { notation: "compact" }).format(n);
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default async function ChannelDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { user } = await getSessionProfile();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const { data: channel } = await supabase
    .from("mcn_checks")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!channel) notFound();

  const raw = (channel.raw_response ?? {}) as RawResponse;
  const hasOwner = Boolean(channel.network || channel.network_contact_email);
  // eslint-disable-next-line react-hooks/purity -- server component, evaluated fresh per request
  const isRecentCheck = Date.now() - new Date(channel.created_at).getTime() < 60 * 60 * 1000;
  const videos = raw.videos ?? [];
  const reports = raw.reports;

  return (
    <div className="flex flex-col gap-6">
      <nav className="flex items-center gap-1.5 text-sm">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <LuArrowLeft className="size-4" />
          Copyright
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="font-medium text-foreground">#{channel.check_number}</span>
      </nav>

      <Card>
        <CardContent className="flex flex-col gap-6 sm:flex-row sm:items-start">
          {channel.avatar_url ? (
            <Image
              src={channel.avatar_url}
              alt={channel.channel_name ?? ""}
              width={80}
              height={80}
              unoptimized
              className="size-20 shrink-0 rounded-full border object-cover"
            />
          ) : (
            <div className="flex size-20 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xl font-semibold text-primary">
              {initials(channel.channel_name ?? channel.channel_input)}
            </div>
          )}

          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <div>
              <h1 className="font-heading text-2xl font-semibold">
                {channel.channel_name ?? channel.channel_input}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                {raw.custom_url ? (
                  <a
                    href={`https://youtube.com/${raw.custom_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary hover:underline"
                  >
                    {raw.custom_url}
                  </a>
                ) : null}
                {raw.custom_url && channel.channel_id && <span>·</span>}
                {channel.channel_id && <span>{channel.channel_id}</span>}
                {!raw.custom_url && !channel.channel_id && <span>{channel.channel_input}</span>}
              </div>
            </div>

            {raw.description && (
              <ExpandableText
                text={raw.description}
                className="max-w-2xl text-sm text-muted-foreground"
              />
            )}

            <div className="flex flex-wrap gap-4 text-sm">
              <span className="flex items-center gap-1.5">
                <LuUsers className="size-4 text-muted-foreground" />
                <strong>{fmt(channel.subscriber_count)}</strong>
                <span className="text-muted-foreground">subscribers</span>
              </span>
              <span className="flex items-center gap-1.5">
                <LuEye className="size-4 text-muted-foreground" />
                <strong>{fmt(channel.total_views)}</strong>
                <span className="text-muted-foreground">views</span>
              </span>
              <span className="flex items-center gap-1.5">
                <LuVideo className="size-4 text-muted-foreground" />
                <strong>{fmt(channel.video_count)}</strong>
                <span className="text-muted-foreground">videos</span>
              </span>
            </div>
          </div>

          <Card size="sm" className="w-full shrink-0 bg-muted/40 sm:w-64">
            <CardHeader className="gap-1 pb-1">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Owner &amp; contact
              </p>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Network</p>
                <p className="font-medium">{channel.network ?? "Independent"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Contact email</p>
                {channel.network_contact_email ? (
                  <a
                    href={`mailto:${channel.network_contact_email}`}
                    className="font-medium text-primary underline underline-offset-4"
                  >
                    {channel.network_contact_email}
                  </a>
                ) : (
                  <p className="font-medium text-muted-foreground">Not available</p>
                )}
              </div>
              {!channel.network && isRecentCheck && (
                <p className="text-xs text-muted-foreground">
                  Network data may take a few minutes to appear for newly added channels.
                </p>
              )}
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[380px_1fr]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-base">Basic information</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <DetailRow label="Channel name" value={channel.channel_name ?? "N/A"} />
            <DetailRow label="Channel ID" value={channel.channel_id ?? "N/A"} />
            <DetailRow label="Unique" value={raw.custom_url ?? "N/A"} />
            <DetailRow
              label="Date of creation"
              value={
                raw.date_of_creation
                  ? new Date(raw.date_of_creation).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "N/A"
              }
            />
            <DetailRow label="Country" value={raw.country_code ?? "N/A"} />
            <DetailRow label="Language" value={raw.language ?? "N/A"} />
            <DetailRow
              label="Status"
              value={
                <Badge
                  variant={
                    channel.status === "success"
                      ? "default"
                      : channel.status === "not_found"
                        ? "secondary"
                        : "destructive"
                  }
                >
                  {channel.status === "success"
                    ? "Succeeded"
                    : channel.status === "not_found"
                      ? "Not found"
                      : "Failed"}
                </Badge>
              }
            />
            <DetailRow label="Network" value={channel.network ?? "Independent"} />
            <DetailRow
              label="Last checked"
              value={new Date(channel.created_at).toLocaleString()}
            />
          </CardContent>
        </Card>

        <Tabs defaultValue="copyright">
          <TabsList>
            <TabsTrigger value="copyright">Copyright</TabsTrigger>
            <TabsTrigger value="video">Video</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="copyright" className="pt-4">
            <Card>
              <CardHeader>
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Ownership
                </p>
                <CardTitle className="text-base">Copyright information</CardTitle>
              </CardHeader>
              <CardContent>
                {hasOwner ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-lg border p-4">
                      <p className="text-xs text-muted-foreground">Content owner</p>
                      <p className="mt-1 font-medium">{channel.network}</p>
                    </div>
                    <div className="rounded-lg border p-4">
                      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <LuMail className="size-3.5" /> Contact email
                      </p>
                      <p className="mt-1 font-medium">
                        {channel.network_contact_email ?? "Not available"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1 py-8 text-center text-sm text-muted-foreground">
                    <p>No network or ownership data found for this channel.</p>
                    {isRecentCheck && (
                      <p className="text-xs">
                        Network data may take a few minutes to appear for newly added channels.
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="video" className="pt-4">
            <Card>
              <CardHeader>
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Recent uploads
                </p>
                <CardTitle className="text-base">Videos &amp; claim status</CardTitle>
              </CardHeader>
              <CardContent>
                {videos.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    No video data available for this channel.
                  </p>
                ) : (
                  <div className="overflow-x-auto rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead className="text-right">Views</TableHead>
                          <TableHead>Published</TableHead>
                          <TableHead>Claim status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {videos.map((v) => (
                          <TableRow key={v.title}>
                            <TableCell className="max-w-[280px] truncate font-medium">
                              {v.title}
                            </TableCell>
                            <TableCell className="text-right">{fmt(v.views)}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {new Date(v.published_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {v.claim_status === "claimed" ? (
                                <Badge variant="destructive" className="gap-1">
                                  <LuCircleAlert className="size-3.5" /> Claimed
                                </Badge>
                              ) : (
                                <Badge className="gap-1 bg-emerald-600/10 text-emerald-700 dark:text-emerald-400">
                                  <LuCircleCheck className="size-3.5" /> Clear
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="pt-4">
            <Card>
              <CardHeader>
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Revenue &amp; claims
                </p>
                <CardTitle className="text-base">Monthly report</CardTitle>
              </CardHeader>
              <CardContent>
                {!reports ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    No report data available for this channel.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <ReportStat
                      icon={LuEye}
                      label="Monthly views"
                      value={fmt(reports.monthly_views)}
                    />
                    <ReportStat
                      icon={LuDollarSign}
                      label="Est. revenue"
                      value={`$${reports.estimated_revenue_usd.toLocaleString()}`}
                    />
                    <ReportStat
                      icon={LuCircleAlert}
                      label="Claims this month"
                      value={String(reports.claims_this_month)}
                    />
                    <ReportStat
                      icon={LuUndo2}
                      label="Released claims"
                      value={String(reports.released_claims)}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b pb-3 last:border-0 last:pb-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="truncate font-medium">{value}</span>
    </div>
  );
}

function ReportStat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border p-3">
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="size-3.5" />
        {label}
      </span>
      <span className="font-heading text-lg font-semibold">{value}</span>
    </div>
  );
}

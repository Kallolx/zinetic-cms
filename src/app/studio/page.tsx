import Link from "next/link";
import { LuArrowRight, LuFolderOpen, LuLifeBuoy, LuWallet } from "react-icons/lu";
import { getDashboardSession } from "@/lib/supabase/dashboard-session";
import { createClient } from "@/lib/supabase/server";
import { GROUPS } from "@/lib/studio/tools";
import { allArt } from "@/lib/studio/art";
import { formatCredits } from "@/lib/credits";
import { HomeHero } from "@/components/studio/home-hero";
import { BentoTile } from "@/components/studio/media";
import { GRID, LAYOUT } from "@/lib/studio/bento";
import { WaveArt } from "@/components/studio/audio-player";

const PANEL = "relative flex h-full flex-col justify-between overflow-hidden rounded-[1.75rem] bg-white/[0.04] p-6 ring-1 ring-white/10";

export default async function StudioHome() {
  const { user, profile } = await getDashboardSession();
  const supabase = await createClient();
  const [{ count }, { data: latest }] = await Promise.all([
    supabase.from("studio_generations").select("id", { count: "exact", head: true }).eq("user_id", user!.id),
    supabase
      .from("studio_generations")
      .select("title")
      .eq("user_id", user!.id)
      .eq("status", "done")
      .order("created_at", { ascending: false })
      .limit(1),
  ]);
  const art = allArt();

  return (
    <div className="flex flex-col gap-12">
      <section className={GRID}>
        <div className="col-span-2 row-span-2 md:col-span-8">
          <HomeHero name={profile?.full_name ?? ""} art={art} />
        </div>

        <Link href="/studio/library" className={`${PANEL} group col-span-2 md:col-span-4 transition-colors hover:bg-white/[0.07]`}>
          <div aria-hidden className="absolute inset-x-6 top-6 h-12 opacity-50">
            <WaveArt animate={false} />
          </div>
          <LuFolderOpen className="relative size-6 text-white/70" />
          <div>
            <p className="font-heading text-4xl font-bold tabular-nums">{count ?? 0}</p>
            <p className="mt-1 flex items-center justify-between text-sm text-white/60">
              <span className="line-clamp-1">{latest?.[0]?.title ? `Latest: ${latest[0].title}` : "generations in your Library"}</span>
              <LuArrowRight className="size-4 shrink-0 transition-transform group-hover:translate-x-1" />
            </p>
          </div>
        </Link>

        <div className={`${PANEL} col-span-1 md:col-span-2`}>
          <LuWallet className="size-6 text-white/70" />
          <div>
            <p className="text-xs text-white/50">Balance</p>
            <p className="font-heading text-xl font-semibold">{formatCredits(Number(profile?.wallet_balance ?? 0))}</p>
          </div>
        </div>
        <Link href="/dashboard/support" className={`${PANEL} group col-span-1 md:col-span-2 transition-colors hover:bg-white/[0.07]`}>
          <LuLifeBuoy className="size-6 text-white/70" />
          <div>
            <p className="text-xs text-white/50">Need help?</p>
            <p className="font-heading text-xl font-semibold">Support</p>
          </div>
        </Link>
      </section>

      {GROUPS.map((g) => (
        <section key={g.id} className="flex flex-col gap-5">
          <div>
            <h2 className="font-heading text-2xl font-semibold">{g.label}</h2>
            <p className="mt-1 text-sm text-white/55">{g.blurb}</p>
          </div>
          <div className={GRID}>
            {LAYOUT[g.id].map(([id, size, span]) => (
              <BentoTile key={id} toolId={id} art={art[id]} size={size} className={span} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

import Link from "next/link";
import { LuArrowUpRight, LuClock } from "react-icons/lu";
import { getDashboardSession } from "@/lib/supabase/dashboard-session";
import { createClient } from "@/lib/supabase/server";
import { GROUPS, TOOLS } from "@/lib/studio/tools";
import { hasElevenLabs } from "@/lib/studio/elevenlabs";
import { hasHeyGen } from "@/lib/studio/heygen";

export default async function StudioHome() {
  const { user } = await getDashboardSession();
  const supabase = await createClient();
  const { count } = await supabase
    .from("studio_generations")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user!.id);

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-heading text-3xl font-semibold">AI Studio</h2>
          <p className="mt-1 text-[0.925rem] text-muted-foreground">Voice, audio and video tools in one place.</p>
        </div>
        <div className="flex items-center gap-5 text-sm text-muted-foreground">
          <span>
            <span className="font-heading text-xl font-semibold text-foreground">{count ?? 0}</span> generations
          </span>
          <span className="flex items-center gap-1.5">
            <span className={`size-2 rounded-full ${hasElevenLabs() ? "bg-emerald-500" : "bg-muted-foreground/40"}`} /> Voice
          </span>
          <span className="flex items-center gap-1.5">
            <span className={`size-2 rounded-full ${hasHeyGen() ? "bg-emerald-500" : "bg-muted-foreground/40"}`} /> Video
          </span>
        </div>
      </div>

      {GROUPS.map((g) => (
        <section key={g.id}>
          <div className="mb-2 flex items-baseline justify-between gap-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em]">{g.label}</h3>
            <p className="text-xs text-muted-foreground">{g.blurb}</p>
          </div>
          <ul className="divide-y border-y">
            {TOOLS.filter((t) => t.group === g.id).map((t) => {
              const Icon = t.icon;
              const body = (
                <>
                  <Icon className="size-6 shrink-0 text-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{t.name}</p>
                    <p className="truncate text-sm text-muted-foreground">{t.blurb}</p>
                  </div>
                  {t.href ? (
                    <LuArrowUpRight className="size-5 shrink-0 text-muted-foreground transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" />
                  ) : (
                    <span className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
                      <LuClock className="size-3.5" /> Soon
                    </span>
                  )}
                </>
              );
              return (
                <li key={t.id}>
                  {t.href ? (
                    <Link href={t.href} className="group flex items-center gap-4 px-1 py-4 transition-colors hover:bg-accent/40 sm:hover:pl-3">
                      {body}
                    </Link>
                  ) : (
                    <div className="flex items-center gap-4 px-1 py-4 opacity-55">{body}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}

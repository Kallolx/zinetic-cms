import Image from "next/image";
import { getDashboardSession } from "@/lib/supabase/dashboard-session";
import { createClient } from "@/lib/supabase/server";
import { hasHeyGen } from "@/lib/studio/heygen";
import { ToolPage } from "@/components/studio/tool-page";
import { CreatorForm } from "./form";

export default async function Page() {
  const { user } = await getDashboardSession();
  const supabase = await createClient();
  const { data: mine } = await supabase
    .from("studio_avatars")
    .select("id, name, created_at")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <ToolPage toolId="avatar-creator" notice={!hasHeyGen() ? "HeyGen is not connected yet. Add HEYGEN_API_KEY to the environment and restart." : null}>
      <CreatorForm />
      <section className="flex flex-col gap-3 border-t pt-8">
        <h3 className="text-sm font-semibold">Your avatars</h3>
        {(mine ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">You have not created any avatars yet.</p>
        ) : (
          <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {(mine ?? []).map((a) => (
              <li key={a.id}>
                <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-muted">
                  <Image src={`/api/studio/files/${a.id}`} alt={a.name} fill unoptimized sizes="160px" className="object-cover" />
                </div>
                <p className="mt-1.5 truncate text-sm">{a.name}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </ToolPage>
  );
}

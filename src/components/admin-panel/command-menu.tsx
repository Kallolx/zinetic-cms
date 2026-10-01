"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LuCornerDownLeft, LuLoaderCircle, LuSearch, LuUserRound } from "react-icons/lu";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ALL_ENTRIES, QUICK_ACTIONS } from "@/components/admin-panel/nav";

type Customer = { id: string; full_name: string | null; email: string; status: string };
type Result = { key: string; href: string; title: string; sub?: string; icon: React.ReactNode; group: string };

/**
 * Press Ctrl or Cmd + K anywhere in the admin to jump to a page or a customer.
 * Customers are looked up as you type.
 */
export function CommandMenu({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [active, setActive] = React.useState(0);

  const q = query.trim();

  // look customers up a moment after typing stops
  React.useEffect(() => {
    if (q.length < 2) return;
    let cancelled = false;
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(q)}`);
        const json = (await res.json()) as { customers?: Customer[] };
        if (!cancelled) setCustomers(json.customers ?? []);
      } catch {
        if (!cancelled) setCustomers([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 180);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [q]);

  const results = React.useMemo<Result[]>(() => {
    const needle = q.toLowerCase();
    const pages: Result[] = [...QUICK_ACTIONS.map((a) => ({ ...a, section: "Shortcuts" })), ...ALL_ENTRIES]
      .filter((e) => !needle || e.label.toLowerCase().includes(needle) || ("section" in e && String(e.section).toLowerCase().includes(needle)))
      .map((e) => ({ key: e.href + e.label, href: e.href, title: e.label, sub: "section" in e ? String(e.section) : undefined, icon: e.icon, group: "Go to" }));
    const people: Result[] = (q.length >= 2 ? customers : []).map((c) => ({
      key: c.id,
      href: `/admin/customers/${c.id}`,
      title: c.full_name || c.email,
      sub: `${c.email} · ${c.status}`,
      icon: <LuUserRound />,
      group: "Customers",
    }));
    return [...people, ...pages];
  }, [q, customers]);

  const go = (r: Result) => {
    onOpenChange(false);
    setQuery("");
    setCustomers([]);
    router.push(r.href);
  };

  const safeActive = Math.min(active, Math.max(results.length - 1, 0));
  const groups = results.reduce<Record<string, Result[]>>((acc, r) => ((acc[r.group] ??= []).push(r), acc), {});
  let index = -1;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) {
          setQuery("");
          setCustomers([]);
          setActive(0);
        }
      }}
    >
      <DialogContent showCloseButton={false} className="top-[18%] translate-y-0 gap-0 overflow-hidden p-0 sm:max-w-xl">
        <DialogTitle className="sr-only">Search the admin</DialogTitle>
        <div className="flex items-center gap-3 border-b px-4">
          {loading ? <LuLoaderCircle className="size-4 animate-spin text-muted-foreground" /> : <LuSearch className="size-4 text-muted-foreground" />}
          <input
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((a) => Math.min(a + 1, results.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((a) => Math.max(a - 1, 0));
              } else if (e.key === "Enter" && results[safeActive]) {
                e.preventDefault();
                go(results[safeActive]);
              }
            }}
            placeholder="Search customers, or jump to a page"
            className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="rounded border px-1.5 py-0.5 text-[0.65rem] text-muted-foreground">Esc</kbd>
        </div>

        <div className="max-h-96 overflow-y-auto p-2">
          {results.length === 0 && <p className="px-3 py-8 text-center text-sm text-muted-foreground">Nothing found for “{q}”.</p>}
          {Object.entries(groups).map(([group, items]) => (
            <div key={group} className="mb-1">
              <p className="px-3 pt-2 pb-1 text-xs font-medium text-muted-foreground">{group}</p>
              {items.map((r) => {
                index += 1;
                const i = index;
                return (
                  <button
                    key={r.key}
                    type="button"
                    onMouseEnter={() => setActive(i)}
                    onClick={() => go(r)}
                    className={cn("flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left text-sm", i === safeActive ? "bg-accent" : "hover:bg-accent/50")}
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-background text-muted-foreground [&_svg]:size-4">{r.icon}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{r.title}</span>
                      {r.sub && <span className="block truncate text-xs text-muted-foreground">{r.sub}</span>}
                    </span>
                    {i === safeActive && <LuCornerDownLeft className="size-4 text-muted-foreground" />}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

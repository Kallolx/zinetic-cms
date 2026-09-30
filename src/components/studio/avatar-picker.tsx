"use client";

import * as React from "react";
import Image from "next/image";
import { LuCheck, LuSearch } from "react-icons/lu";
import { cn } from "@/lib/utils";

export type AvatarItem = { id: string; name: string; image: string; mine?: boolean };

export function AvatarPicker({
  items,
  value,
  onChange,
}: {
  items: AvatarItem[];
  value: string;
  onChange: (id: string, mine: boolean) => void;
}) {
  const [q, setQ] = React.useState("");
  const needle = q.trim().toLowerCase();
  const shown = (needle ? items.filter((i) => i.name.toLowerCase().includes(needle)) : items).slice(0, 80);

  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="relative border-b">
        <LuSearch className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={`Search ${items.length} avatars`}
          className="w-full bg-transparent py-2.5 pr-3 pl-9 text-sm outline-none"
        />
      </div>
      <div className="grid max-h-80 grid-cols-3 gap-2 overflow-y-auto p-2">
        {shown.length === 0 && <p className="col-span-3 py-6 text-center text-sm text-muted-foreground">No avatars found.</p>}
        {shown.map((a) => {
          const active = a.id === value;
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => onChange(a.id, Boolean(a.mine))}
              className={cn(
                "group relative aspect-[3/4] cursor-pointer overflow-hidden rounded-md border-2 bg-muted text-left",
                active ? "border-primary" : "border-transparent"
              )}
            >
              <Image src={a.image} alt="" fill unoptimized sizes="120px" className="object-cover" />
              <span className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/75 to-transparent px-2 pt-6 pb-1.5 text-[0.7rem] text-white">
                {a.name}
              </span>
              {a.mine && <span className="absolute top-1.5 left-1.5 rounded bg-black/60 px-1.5 py-0.5 text-[0.6rem] text-white">Yours</span>}
              {active && (
                <span className="absolute top-1.5 right-1.5 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <LuCheck className="size-3" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

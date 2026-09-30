"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { LuArrowUpRight, LuClock } from "react-icons/lu";
import { cn } from "@/lib/utils";
import { TOOLS, type StudioTool } from "@/lib/studio/tools";

/** Looping muted clip (or still) that fills its parent. Plays only while visible. */
export function MediaBg({
  media,
  className,
  playOnHover = false,
}: {
  media: StudioTool["media"];
  className?: string;
  playOnHover?: boolean;
}) {
  const ref = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el || playOnHover) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) void el.play().catch(() => {});
      else el.pause();
    });
    io.observe(el);
    return () => io.disconnect();
  }, [playOnHover]);

  if (media.type === "image") {
    return <Image src={media.src} alt="" fill unoptimized sizes="400px" className={cn("object-cover", className)} />;
  }
  return (
    <video
      ref={ref}
      src={media.src}
      muted
      loop
      playsInline
      preload="metadata"
      className={cn("absolute inset-0 size-full object-cover", className)}
    />
  );
}

/** Big poster card for a tool: clip behind, gradient icon tile, name and blurb. */
// takes an id, not the tool: tool objects hold icon components, which cannot cross from a server page
export function ToolCard({ toolId, className }: { toolId: string; className?: string }) {
  const tool = TOOLS.find((t) => t.id === toolId)!;
  const Icon = tool.icon;
  const ref = React.useRef<HTMLDivElement>(null);

  const hover = (on: boolean) => {
    const v = ref.current?.querySelector("video");
    if (!v) return;
    if (on) void v.play().catch(() => {});
    else v.pause();
  };

  const inner = (
    <div
      ref={ref}
      onMouseEnter={() => hover(true)}
      onMouseLeave={() => hover(false)}
      className={cn(
        "group relative isolate flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-2xl bg-zinc-900 text-white ring-1 ring-white/10 transition-transform duration-500",
        tool.href && "hover:-translate-y-1",
        className
      )}
    >
      <div className={cn("absolute inset-0 -z-10 transition-transform duration-700", tool.href && "group-hover:scale-105", tool.soon && "grayscale")}>
        <MediaBg media={tool.media} playOnHover />
      </div>
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />

      <div className="flex items-start justify-between p-4">
        <span className={cn("flex size-10 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg [&_svg]:size-5", tool.accent)}>
          <Icon />
        </span>
        {tool.soon ? (
          <span className="flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-[0.7rem] backdrop-blur">
            <LuClock className="size-3" /> Soon
          </span>
        ) : (
          <span className="flex size-8 items-center justify-center rounded-full bg-white/15 opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
            <LuArrowUpRight className="size-4" />
          </span>
        )}
      </div>

      <div className="mt-auto p-4 pt-16">
        <p className="font-heading text-lg leading-tight font-semibold">{tool.name}</p>
        <p className="mt-1 line-clamp-2 text-[0.8rem] leading-snug text-white/70">{tool.blurb}</p>
      </div>
    </div>
  );

  return tool.href ? <Link href={tool.href}>{inner}</Link> : inner;
}

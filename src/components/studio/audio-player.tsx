"use client";

import * as React from "react";
import { LuDownload, LuPause, LuPlay } from "react-icons/lu";
import { cn } from "@/lib/utils";

const BARS = 64;

/** Deterministic pseudo-waveform so the same file always looks the same. */
function barsFor(seed: string) {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return Array.from({ length: BARS }, (_, i) => {
    h = Math.imul(h ^ (h >>> 15), 2246822507) + i;
    const r = ((h >>> 0) % 1000) / 1000;
    const env = 0.35 + 0.65 * Math.sin((i / BARS) * Math.PI);
    return 0.18 + r * 0.82 * env;
  });
}

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

/** Bars that pulse. Used as the idle and working artwork for audio tools. */
export function WaveArt({ animate = true, className, accent = "from-fuchsia-500 to-rose-500" }: { animate?: boolean; className?: string; accent?: string }) {
  const bars = React.useMemo(() => barsFor("wave-art"), []);
  return (
    <div aria-hidden className={cn("flex h-full items-center justify-center gap-[3px]", className)}>
      {bars.map((h, i) => (
        <span
          key={i}
          className={cn("w-[3px] rounded-full bg-gradient-to-t", accent, animate && "zl-wave")}
          style={{ height: `${h * 100}%`, animationDelay: `${(i % 16) * 70}ms` }}
        />
      ))}
    </div>
  );
}

export function AudioPlayer({
  src,
  seed,
  name,
  title,
  compact = false,
}: {
  src: string;
  seed: string;
  name: string;
  title?: string;
  compact?: boolean;
}) {
  const ref = React.useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = React.useState(false);
  const [time, setTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const bars = React.useMemo(() => barsFor(seed), [seed]);
  const progress = duration ? time / duration : 0;

  function toggle() {
    const a = ref.current;
    if (!a) return;
    if (a.paused) void a.play();
    else a.pause();
  }

  function seek(e: React.MouseEvent<HTMLDivElement>) {
    const a = ref.current;
    if (!a || !duration) return;
    const r = e.currentTarget.getBoundingClientRect();
    a.currentTime = ((e.clientX - r.left) / r.width) * duration;
  }

  return (
    <div className={cn("rounded-2xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] ring-1 ring-white/10", compact ? "p-3" : "p-5")}>
      <audio
        ref={ref}
        src={src}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
      />
      {title && <p className="mb-3 line-clamp-1 text-sm font-medium">{title}</p>}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? "Pause" : "Play"}
          className={cn(
            "flex shrink-0 cursor-pointer items-center justify-center rounded-full bg-white text-black shadow-lg transition-transform hover:scale-105",
            compact ? "size-10" : "size-14"
          )}
        >
          {playing ? <LuPause className="size-5" /> : <LuPlay className="size-5 translate-x-px" />}
        </button>
        <div className="min-w-0 flex-1">
          <div onClick={seek} className={cn("flex cursor-pointer items-center gap-[2px]", compact ? "h-10" : "h-14")}>
            {bars.map((h, i) => (
              <span
                key={i}
                className={cn("flex-1 rounded-full transition-colors", i / BARS < progress ? "bg-white" : "bg-white/25")}
                style={{ height: `${h * 100}%` }}
              />
            ))}
          </div>
          <div className="mt-1.5 flex justify-between text-[0.7rem] tabular-nums text-white/55">
            <span>{fmt(time)}</span>
            <span>{duration ? fmt(duration) : "--:--"}</span>
          </div>
        </div>
        <a
          href={src}
          download={name}
          aria-label="Download"
          className="flex size-10 shrink-0 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        >
          <LuDownload className="size-5" />
        </a>
      </div>
    </div>
  );
}

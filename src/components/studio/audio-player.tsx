"use client";

import * as React from "react";
import { LuDownload, LuPause, LuPlay, LuRotateCcw, LuRotateCw, LuVolume2, LuVolumeX } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const BARS = 72;

/** Deterministic pseudo-waveform so the same file always looks the same. */
function barsFor(seed: string) {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return Array.from({ length: BARS }, (_, i) => {
    h = Math.imul(h ^ (h >>> 15), 2246822507) + i;
    const r = ((h >>> 0) % 1000) / 1000;
    const env = 0.35 + 0.65 * Math.sin((i / BARS) * Math.PI);
    return 0.16 + r * 0.84 * env;
  });
}

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
const SPEEDS = [1, 1.25, 1.5, 2, 0.75];

/** Plain bars, used as quiet decoration. */
export function WaveArt({ animate = false, className }: { animate?: boolean; className?: string; accent?: string }) {
  const bars = React.useMemo(() => barsFor("wave-art"), []);
  return (
    <div aria-hidden className={cn("flex h-full items-center justify-center gap-[3px]", className)}>
      {bars.map((h, i) => (
        <span
          key={i}
          className={cn("w-[3px] rounded-full bg-current", animate && "zl-wave")}
          style={{ height: `${h * 100}%`, animationDelay: `${(i % 16) * 70}ms` }}
        />
      ))}
    </div>
  );
}

/**
 * The real player. With no `src` (or `disabled`) it renders exactly the same
 * controls, switched off, so the output area looks like the finished result
 * before anything has been made.
 */
export function AudioPlayer({
  src,
  seed = "placeholder",
  name = "audio.mp3",
  title,
  disabled = false,
  busy = false,
  compact = false,
}: {
  src?: string;
  seed?: string;
  name?: string;
  title?: string;
  disabled?: boolean;
  busy?: boolean;
  compact?: boolean;
}) {
  const ref = React.useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = React.useState(false);
  const [time, setTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [muted, setMuted] = React.useState(false);
  const [speed, setSpeed] = React.useState(0);
  const off = disabled || !src;
  const bars = React.useMemo(() => barsFor(seed), [seed]);
  const progress = duration ? time / duration : 0;

  const toggle = () => {
    const a = ref.current;
    if (!a) return;
    if (a.paused) void a.play();
    else a.pause();
  };
  const skip = (by: number) => {
    const a = ref.current;
    if (a) a.currentTime = Math.max(0, Math.min(duration || 0, a.currentTime + by));
  };
  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const a = ref.current;
    if (!a || !duration) return;
    const r = e.currentTarget.getBoundingClientRect();
    a.currentTime = ((e.clientX - r.left) / r.width) * duration;
  };
  const cycleSpeed = () => {
    const n = (speed + 1) % SPEEDS.length;
    setSpeed(n);
    if (ref.current) ref.current.playbackRate = SPEEDS[n];
  };

  return (
    <div className={cn("rounded-xl border bg-card", compact ? "p-3" : "p-4", off && "select-none")}>
      {!off && (
        <audio
          ref={ref}
          src={src}
          preload="metadata"
          muted={muted}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
          onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        />
      )}
      {title && <p className="mb-3 line-clamp-1 text-sm font-medium">{title}</p>}

      <div
        onClick={off ? undefined : seek}
        className={cn("flex items-center gap-[2px]", compact ? "h-12" : "h-20", off ? "cursor-default" : "cursor-pointer", busy && "animate-pulse")}
      >
        {bars.map((h, i) => (
          <span
            key={i}
            className={cn("flex-1 rounded-full", off ? "bg-muted-foreground/20" : i / BARS < progress ? "bg-foreground" : "bg-muted-foreground/35")}
            style={{ height: `${h * 100}%` }}
          />
        ))}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <Button size="icon" onClick={toggle} disabled={off} aria-label={playing ? "Pause" : "Play"}>
          {playing ? <LuPause /> : <LuPlay className="translate-x-px" />}
        </Button>
        <Button variant="ghost" size="icon-sm" onClick={() => skip(-10)} disabled={off} aria-label="Back 10 seconds">
          <LuRotateCcw />
        </Button>
        <Button variant="ghost" size="icon-sm" onClick={() => skip(10)} disabled={off} aria-label="Forward 10 seconds">
          <LuRotateCw />
        </Button>
        <span className="ml-1 text-xs tabular-nums text-muted-foreground">
          {off ? "0:00" : fmt(time)} / {off || !duration ? "0:00" : fmt(duration)}
        </span>
        <div className="ml-auto flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={cycleSpeed} disabled={off} aria-label="Playback speed" className="w-12 tabular-nums">
            {SPEEDS[speed]}x
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={() => setMuted((m) => !m)} disabled={off} aria-label={muted ? "Unmute" : "Mute"}>
            {muted ? <LuVolumeX /> : <LuVolume2 />}
          </Button>
          {off ? (
            <Button variant="ghost" size="icon-sm" disabled aria-label="Download">
              <LuDownload />
            </Button>
          ) : (
            <Button variant="ghost" size="icon-sm" render={<a href={src} download={name} />} aria-label="Download">
              <LuDownload />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

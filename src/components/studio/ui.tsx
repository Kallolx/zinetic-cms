"use client";

import * as React from "react";
import {
  LuCheck,
  LuDownload,
  LuFileAudio,
  LuLoaderCircle,
  LuPause,
  LuPlay,
  LuSearch,
  LuTriangleAlert,
  LuUpload,
  LuX,
} from "react-icons/lu";
import { cn } from "@/lib/utils";
import { TOOLS, type StudioTool } from "@/lib/studio/tools";
import type { PublicEngine } from "@/lib/studio/engines";
import { FEATURE_LABELS } from "@/lib/studio/engine-catalog";
import { AudioPlayer, WaveArt } from "@/components/studio/audio-player";
import { MediaBg } from "@/components/studio/media";
import type { JobState } from "@/components/studio/use-job";

/** Blob URL for a picked file, revoked when the file changes or the page unmounts. */
export function useObjectUrl(file: File | null) {
  const url = React.useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  React.useEffect(() => () => {
    if (url) URL.revokeObjectURL(url);
  }, [url]);
  return url;
}

type ToolCtx = { id: string; art: StudioTool["media"]; engines: PublicEngine[]; key: string; setKey: (k: string) => void };
const ToolContext = React.createContext<ToolCtx | null>(null);

/** Lets the banner, stage and forms know which tool they belong to, its artwork and its engines. */
export function ToolProvider({
  toolId,
  art,
  engines,
  children,
}: {
  toolId: string;
  art: StudioTool["media"];
  engines: PublicEngine[];
  children: React.ReactNode;
}) {
  const [key, setKey] = React.useState(engines[0]?.key ?? "");
  const value = React.useMemo(() => ({ id: toolId, art, engines, key, setKey }), [toolId, art, engines, key]);
  return <ToolContext.Provider value={value}>{children}</ToolContext.Provider>;
}

const useTool = () => {
  const ctx = React.useContext(ToolContext);
  const tool = TOOLS.find((t) => t.id === ctx?.id) ?? TOOLS[0];
  return { ...tool, media: ctx?.art ?? tool.media };
};

/** The engine the customer picked for this tool, plus what it supports. */
export function useEngine() {
  const ctx = React.useContext(ToolContext);
  const engine = ctx?.engines.find((e) => e.key === ctx.key) ?? ctx?.engines[0];
  return {
    key: engine?.key ?? "",
    engine,
    has: (feature: string) => Boolean(engine?.features.includes(feature)),
  };
}

export function costLabel(e: PublicEngine) {
  const unit = e.cost_unit === "minute" ? " / min" : e.cost_unit === "1k_chars" ? " / 1,000 characters" : "";
  if (e.credit_cost === 0) return "Free";
  return `${e.credit_cost} ${e.credit_cost === 1 ? "credit" : "credits"}${unit}`;
}

/** Engine choice. One engine: a quiet price line. Two or more: a selectable card each. */
export function EnginePicker() {
  const ctx = React.useContext(ToolContext);
  if (!ctx || ctx.engines.length === 0) return null;

  if (ctx.engines.length === 1) {
    const e = ctx.engines[0];
    return (
      <p className="flex items-center justify-between rounded-lg bg-white/[0.04] px-3 py-2 text-xs text-white/60 ring-1 ring-white/10">
        <span>{e.label}{e.description ? ` · ${e.description}` : ""}</span>
        <span className="font-medium text-white">{costLabel(e)}</span>
      </p>
    );
  }

  return (
    <Field label="Engine">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        {ctx.engines.map((e) => {
          const active = e.key === ctx.key;
          return (
            <button
              key={e.key}
              type="button"
              onClick={() => ctx.setKey(e.key)}
              className={cn(
                "flex cursor-pointer flex-col gap-1.5 rounded-xl p-3 text-left ring-1 transition-colors",
                active ? "bg-white/10 ring-white/40" : "bg-white/[0.03] ring-white/10 hover:bg-white/[0.06]"
              )}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold">{e.label}</span>
                {active && <LuCheck className="size-4" />}
              </span>
              {e.description && <span className="text-xs text-white/55">{e.description}</span>}
              <span className="text-xs font-medium text-white/85">{costLabel(e)}</span>
              {e.features.length > 0 && (
                <span className="flex flex-wrap gap-1">
                  {e.features.map((f) => (
                    <span key={f} className="rounded-full bg-white/10 px-2 py-0.5 text-[0.65rem] text-white/60">
                      {FEATURE_LABELS[f] ?? f}
                    </span>
                  ))}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </Field>
  );
}

/** Cinematic banner: the tool's clip behind, gradient icon tile, name and blurb. */
export function ToolHeader() {
  const tool = useTool();
  const Icon = tool.icon;
  return (
    <div className="relative isolate overflow-hidden rounded-3xl ring-1 ring-white/10">
      <div className="absolute inset-0 -z-10">
        <MediaBg media={tool.media} />
      </div>
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-black/80 via-black/45 to-transparent" />
      <div className="flex items-center gap-5 px-6 py-8 sm:px-10 sm:py-11">
        <span className={cn("flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br shadow-xl [&_svg]:size-7", tool.accent)}>
          <Icon />
        </span>
        <div className="min-w-0">
          <h2 className="font-heading text-2xl leading-tight font-semibold sm:text-4xl">{tool.name}</h2>
          <p className="mt-1.5 max-w-xl text-sm text-white/70 sm:text-base">{tool.blurb}</p>
        </div>
      </div>
    </div>
  );
}

/** Controls on the left, output on the right. Stacks on small screens. */
export function Workspace({ form, output }: { form: React.ReactNode; output: React.ReactNode }) {
  return (
    <div className="grid gap-x-10 gap-y-8 lg:grid-cols-[minmax(0,25rem)_minmax(0,1fr)]">
      <div className="flex flex-col gap-6">{form}</div>
      <div className="min-w-0 border-t pt-8 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-10">{output}</div>
    </div>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-medium">{label}</span>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

export const inputClass =
  "w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-3 focus:ring-primary/15 disabled:opacity-60";

export function TextArea({
  value,
  onChange,
  max,
  rows = 7,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  max?: number;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <div>
      <textarea
        value={value}
        onChange={(e) => onChange(max ? e.target.value.slice(0, max) : e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className={cn(inputClass, "resize-y leading-relaxed")}
      />
      {max && (
        <p className="mt-1 text-right text-xs tabular-nums text-muted-foreground">
          {value.length.toLocaleString()} / {max.toLocaleString()}
        </p>
      )}
    </div>
  );
}

export function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="grid auto-cols-fr grid-flow-col gap-1 rounded-lg bg-muted p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            "cursor-pointer rounded-md px-3 py-1.5 text-sm transition-colors",
            value === o.value ? "bg-background font-medium shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function FileDrop({
  accept,
  file,
  onFile,
  hint,
}: {
  accept: string;
  file: File | null;
  onFile: (f: File | null) => void;
  hint: string;
}) {
  const ref = React.useRef<HTMLInputElement>(null);
  const [over, setOver] = React.useState(false);

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const f = e.dataTransfer.files?.[0];
        if (f) onFile(f);
      }}
      className={cn(
        "flex items-center gap-3 rounded-lg border border-dashed px-4 py-5 transition-colors",
        over ? "border-primary bg-primary/5" : "hover:border-foreground/30"
      )}
    >
      <input ref={ref} type="file" accept={accept} hidden onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
      {file ? (
        <>
          <LuFileAudio className="size-6 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{file.name}</p>
            <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
          </div>
          <button
            type="button"
            aria-label="Remove file"
            onClick={() => onFile(null)}
            className="cursor-pointer rounded-md p-1.5 text-muted-foreground hover:bg-accent"
          >
            <LuX className="size-4" />
          </button>
        </>
      ) : (
        <button type="button" onClick={() => ref.current?.click()} className="flex w-full cursor-pointer items-center gap-3 text-left">
          <LuUpload className="size-6 shrink-0 text-muted-foreground" />
          <span>
            <span className="block text-sm font-medium">Choose a file or drop it here</span>
            <span className="block text-xs text-muted-foreground">{hint}</span>
          </span>
        </button>
      )}
    </div>
  );
}

export type PickerItem = { id: string; name: string; meta?: string; preview?: string; image?: string };

/** Searchable list of voices (with a play-preview) used by every voice tool. */
export function VoicePicker({
  items,
  value,
  onChange,
}: {
  items: PickerItem[];
  value: string;
  onChange: (id: string) => void;
}) {
  const [q, setQ] = React.useState("");
  const [playing, setPlaying] = React.useState<string | null>(null);
  const audio = React.useRef<HTMLAudioElement | null>(null);

  React.useEffect(() => () => audio.current?.pause(), []);

  function toggle(item: PickerItem) {
    if (!item.preview) return;
    if (playing === item.id) {
      audio.current?.pause();
      setPlaying(null);
      return;
    }
    audio.current?.pause();
    const a = new Audio(item.preview);
    a.onended = () => setPlaying(null);
    audio.current = a;
    void a.play();
    setPlaying(item.id);
  }

  const needle = q.trim().toLowerCase();
  const shown = needle
    ? items.filter((i) => `${i.name} ${i.meta ?? ""}`.toLowerCase().includes(needle))
    : items;

  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="relative border-b">
        <LuSearch className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={`Search ${items.length} voices`}
          className="w-full bg-transparent py-2.5 pr-3 pl-9 text-sm outline-none"
        />
      </div>
      <ul className="max-h-64 overflow-y-auto">
        {shown.length === 0 && <li className="px-4 py-6 text-center text-sm text-muted-foreground">No voices found.</li>}
        {shown.map((v) => {
          const active = v.id === value;
          return (
            <li key={v.id} className={cn("flex items-center gap-2 border-b last:border-b-0", active && "bg-primary/5")}>
              <button
                type="button"
                onClick={() => onChange(v.id)}
                className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 px-3 py-2.5 text-left"
              >
                <span
                  className={cn(
                    "flex size-4 shrink-0 items-center justify-center rounded-full border",
                    active && "border-primary bg-primary text-primary-foreground"
                  )}
                >
                  {active && <LuCheck className="size-3" />}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{v.name}</span>
                  {v.meta && <span className="block truncate text-xs text-muted-foreground">{v.meta}</span>}
                </span>
              </button>
              {v.preview && (
                <button
                  type="button"
                  aria-label={`Preview ${v.name}`}
                  onClick={() => toggle(v)}
                  className="mr-2 flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  {playing === v.id ? <LuPause className="size-4" /> : <LuPlay className="size-4" />}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function SubmitButton({
  busy,
  disabled,
  children,
  busyLabel = "Working",
  onClick,
}: {
  busy: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  busyLabel?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy || disabled}
      className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {busy && <LuLoaderCircle className="size-4 animate-spin" />}
      {busy ? busyLabel : children}
    </button>
  );
}

/**
 * The stage on the right. Never blank: before a run it previews what the result
 * looks like, while working it animates, and afterwards it shows the result.
 */
export function Output({
  state,
  idle,
  working,
  children,
}: {
  state: JobState;
  idle: string;
  working?: string;
  children?: React.ReactNode;
}) {
  const tool = useTool();
  const isVideo = tool.group === "video" && tool.id !== "avatar-creator";
  const Icon = tool.icon;

  if (state.phase === "done") return <>{children}</>;

  const busy = state.phase === "working";
  const failed = state.phase === "error";

  return (
    <div className="flex flex-col gap-4">
      <div
        className={cn(
          "relative isolate flex items-center justify-center overflow-hidden rounded-3xl bg-zinc-900 ring-1 ring-white/10",
          isVideo ? "aspect-video" : "min-h-[26rem]"
        )}
      >
        {isVideo || tool.id === "avatar-creator" ? (
          <div className={cn("absolute inset-0 -z-10 transition-opacity", busy ? "opacity-40" : "opacity-60")}>
            <MediaBg media={tool.media} />
          </div>
        ) : (
          <>
            <div aria-hidden className={cn("absolute inset-0 -z-10 bg-gradient-to-br opacity-30", tool.accent)} />
            <div className="absolute inset-x-8 top-10 -z-10 h-24 opacity-90">
              <WaveArt animate={busy} accent={tool.accent} />
            </div>
          </>
        )}
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-black/70 via-black/20 to-black/40" />
        {busy && <div aria-hidden className="absolute inset-0 -z-10 animate-pulse bg-white/5" />}

        <div className={cn("flex max-w-sm flex-col items-center gap-3 px-6 text-center", !isVideo && tool.id !== "avatar-creator" && "mt-28")}>
          <span className={cn("flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br shadow-xl [&_svg]:size-7", tool.accent)}>
            {busy ? <LuLoaderCircle className="animate-spin" /> : failed ? <LuTriangleAlert /> : <Icon />}
          </span>
          {busy && (
            <>
              <p className="text-base font-semibold">{state.message ?? "Working on it"}</p>
              <p className="text-sm text-white/65">{working ?? "You can leave this page, it will be in your Library when done."}</p>
            </>
          )}
          {failed && <p className="text-sm text-red-300">{state.error}</p>}
          {!busy && !failed && (
            <>
              <p className="text-base font-semibold">Your result appears here</p>
              <p className="text-sm text-white/65">{idle}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function AudioResult({ id, name }: { id: string; name: string }) {
  return <AudioPlayer src={`/api/studio/files/${id}`} seed={id} name={name} />;
}

export function VideoResult({ id, name }: { id: string; name: string }) {
  return (
    <div className="flex flex-col gap-3">
      <video controls autoPlay src={`/api/studio/files/${id}`} className="aspect-video w-full rounded-3xl bg-black ring-1 ring-white/10" />
      <DownloadLink id={id} name={name} />
    </div>
  );
}

export function DownloadLink({ id, name }: { id: string; name: string }) {
  return (
    <a
      href={`/api/studio/files/${id}`}
      download={name}
      className="inline-flex w-fit items-center gap-2 text-sm font-medium underline underline-offset-4"
    >
      <LuDownload className="size-4" />
      Download
    </a>
  );
}

export type HistoryRow = {
  id: string;
  title: string | null;
  status: string;
  mime_type: string | null;
  error: string | null;
  created_at: string;
};

/** Recent generations for one tool, as a row of cards with cover art. */
export function History({ rows }: { rows: HistoryRow[] }) {
  const tool = useTool();
  if (rows.length === 0) return null;
  return (
    <section className="flex flex-col gap-4 border-t border-white/10 pt-8">
      <h3 className="font-heading text-lg font-semibold">Recent</h3>
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {rows.map((r) => (
          <li key={r.id} className="overflow-hidden rounded-2xl bg-white/[0.04] ring-1 ring-white/10">
            {r.status === "done" && r.mime_type?.startsWith("video") ? (
              <video controls preload="metadata" src={`/api/studio/files/${r.id}`} className="aspect-video w-full bg-black" />
            ) : (
              <div className={cn("relative flex h-24 items-center justify-center bg-gradient-to-br", tool.accent)}>
                <div className="absolute inset-x-6 inset-y-5 opacity-60">
                  <WaveArt animate={false} accent="from-white to-white/70" />
                </div>
                {r.status === "processing" && <LuLoaderCircle className="relative size-6 animate-spin" />}
                {r.status === "failed" && <LuTriangleAlert className="relative size-6" />}
              </div>
            )}
            <div className="flex flex-col gap-2 p-3">
              <p className="line-clamp-1 text-sm font-medium">{r.title ?? "Untitled"}</p>
              {r.status === "done" && r.mime_type?.startsWith("audio") && (
                <AudioPlayer compact src={`/api/studio/files/${r.id}`} seed={r.id} name="audio.mp3" />
              )}
              {r.status === "failed" && <p className="text-xs text-red-300">{r.error ?? "Failed"}</p>}
              <p className="text-xs text-white/45">{new Date(r.created_at).toLocaleString()}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

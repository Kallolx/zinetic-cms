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
import type { JobState } from "@/components/studio/use-job";

/** Blob URL for a picked file, revoked when the file changes or the page unmounts. */
export function useObjectUrl(file: File | null) {
  const url = React.useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  React.useEffect(() => () => {
    if (url) URL.revokeObjectURL(url);
  }, [url]);
  return url;
}

export function ToolHeader({
  icon,
  title,
  blurb,
  badge,
}: {
  icon: React.ReactNode;
  title: string;
  blurb: string;
  badge?: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary [&_svg]:size-6">
        {icon}
      </span>
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="font-heading text-2xl font-semibold">{title}</h2>
          {badge && (
            <span className="rounded-full border px-2.5 py-0.5 text-[0.7rem] font-medium text-muted-foreground">
              {badge}
            </span>
          )}
        </div>
        <p className="mt-1 max-w-2xl text-[0.925rem] text-muted-foreground">{blurb}</p>
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

/** Right-hand side: shows the idle hint, progress, error, or the finished result. */
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
  if (state.phase === "idle") {
    return (
      <div className="flex min-h-64 items-center justify-center text-center text-sm text-muted-foreground">
        <p className="max-w-xs">{idle}</p>
      </div>
    );
  }
  if (state.phase === "working") {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-center">
        <LuLoaderCircle className="size-7 animate-spin text-primary" />
        <p className="text-sm font-medium">{state.message ?? "Working on it"}</p>
        <p className="max-w-xs text-xs text-muted-foreground">{working ?? "You can leave this page, it will be in your Library when done."}</p>
      </div>
    );
  }
  if (state.phase === "error") {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-center">
        <LuTriangleAlert className="size-7 text-destructive" />
        <p className="max-w-sm text-sm text-destructive">{state.error}</p>
      </div>
    );
  }
  return <>{children}</>;
}

export function AudioResult({ id, name }: { id: string; name: string }) {
  return (
    <div className="flex flex-col gap-4">
      <audio controls src={`/api/studio/files/${id}`} className="w-full" />
      <DownloadLink id={id} name={name} />
    </div>
  );
}

export function VideoResult({ id, name }: { id: string; name: string }) {
  return (
    <div className="flex flex-col gap-4">
      <video controls src={`/api/studio/files/${id}`} className="max-h-[28rem] w-full rounded-lg bg-black" />
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

/** Recent generations for one tool, shown under the workspace. */
export function History({ rows }: { rows: HistoryRow[] }) {
  if (rows.length === 0) return null;
  return (
    <section className="flex flex-col gap-3 border-t pt-8">
      <h3 className="text-sm font-semibold">Recent</h3>
      <ul className="divide-y rounded-lg border">
        {rows.map((r) => (
          <li key={r.id} className="flex flex-col gap-2 p-4">
            <div className="flex items-baseline justify-between gap-4 text-sm">
              <span className="line-clamp-1 font-medium">{r.title ?? "Untitled"}</span>
              <span className="shrink-0 text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</span>
            </div>
            {r.status === "done" && r.mime_type?.startsWith("audio") && (
              <audio controls preload="none" src={`/api/studio/files/${r.id}`} className="w-full" />
            )}
            {r.status === "done" && r.mime_type?.startsWith("video") && (
              <video controls preload="none" src={`/api/studio/files/${r.id}`} className="max-h-60 rounded-lg bg-black" />
            )}
            {r.status === "failed" && <p className="text-xs text-destructive">{r.error ?? "Failed"}</p>}
            {r.status === "processing" && <p className="text-xs text-muted-foreground">Still processing</p>}
          </li>
        ))}
      </ul>
    </section>
  );
}

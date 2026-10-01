import { cn } from "@/lib/utils";

export type Point = { label: string; value: number };

const nice = (max: number) => {
  if (max <= 0) return 1;
  const p = Math.pow(10, Math.floor(Math.log10(max)));
  const n = max / p;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p;
};

/** Daily bars with a few gridlines. Pure SVG, no library: hover a bar for its value. */
export function BarChart({
  data,
  format = (n) => String(n),
  height = 200,
  className,
}: {
  data: Point[];
  format?: (n: number) => string;
  height?: number;
  className?: string;
}) {
  const W = 640;
  const H = height;
  const pad = { l: 8, r: 8, t: 12, b: 24 };
  const top = nice(Math.max(...data.map((d) => d.value), 0));
  const iw = W - pad.l - pad.r;
  const ih = H - pad.t - pad.b;
  const bw = iw / Math.max(data.length, 1);
  const gap = Math.min(6, bw * 0.25);
  const every = Math.max(1, Math.ceil(data.length / 8));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={cn("w-full", className)} role="img" aria-label="Bar chart">
      {[0, 0.25, 0.5, 0.75, 1].map((t) => (
        <line key={t} x1={pad.l} x2={W - pad.r} y1={pad.t + ih * (1 - t)} y2={pad.t + ih * (1 - t)} className="stroke-border" strokeDasharray={t === 0 ? undefined : "3 4"} />
      ))}
      {data.map((d, i) => {
        const h = (d.value / top) * ih;
        const x = pad.l + i * bw + gap / 2;
        return (
          <g key={i}>
            <rect x={x} y={pad.t + ih - Math.max(h, d.value > 0 ? 2 : 0)} width={Math.max(bw - gap, 1)} height={Math.max(h, d.value > 0 ? 2 : 0)} rx={2} className="fill-primary/80 transition-colors hover:fill-primary">
              <title>{`${d.label}: ${format(d.value)}`}</title>
            </rect>
            {i % every === 0 && (
              <text x={x + (bw - gap) / 2} y={H - 6} textAnchor="middle" className="fill-muted-foreground" fontSize="10">
                {d.label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/** A small trend line for a stat card. */
export function Sparkline({ values, className }: { values: number[]; className?: string }) {
  if (values.length < 2) return null;
  const W = 120;
  const H = 32;
  const max = Math.max(...values, 1);
  const pts = values.map((v, i) => [(i / (values.length - 1)) * W, H - 3 - (v / max) * (H - 6)]);
  const line = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={cn("h-8 w-24", className)} aria-hidden>
      <path d={`${line} L${W} ${H} L0 ${H} Z`} className="fill-primary/10" />
      <path d={line} fill="none" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="stroke-primary" />
    </svg>
  );
}

/** One horizontal bar per item, for "runs by tool" and similar. */
export function HBars({ items, format = (n) => String(n) }: { items: { label: string; value: number }[]; format?: (n: number) => string }) {
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <ul className="flex flex-col gap-2.5">
      {items.map((i) => (
        <li key={i.label} className="grid grid-cols-[8rem_1fr_3.5rem] items-center gap-3 text-sm">
          <span className="truncate text-muted-foreground">{i.label}</span>
          <span className="h-2 overflow-hidden rounded-full bg-muted">
            <span className="block h-full rounded-full bg-primary/80" style={{ width: `${(i.value / max) * 100}%` }} />
          </span>
          <span className="text-right tabular-nums">{format(i.value)}</span>
        </li>
      ))}
    </ul>
  );
}

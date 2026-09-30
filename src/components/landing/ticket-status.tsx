"use client";

import * as React from "react";
import { LuCheck, LuLoaderCircle, LuSearch } from "react-icons/lu";
import { cn } from "@/lib/utils";

const STEPS = ["Received", "In review", "Resolved"];

// Interface only: no tickets exist behind this form, every lookup shows the same sample result.
export function TicketStatus() {
  const [id, setId] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = id.trim();
    setResult(null);
    if (!value) {
      setError("Enter your ticket ID.");
      return;
    }
    setError(null);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setResult(value);
    }, 700);
  }

  return (
    <div>
      <form onSubmit={onSubmit} className="flex flex-col gap-2.5 sm:flex-row">
        <div className="relative flex-1">
          <LuSearch className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-white/40" />
          <input
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="Ticket ID, e.g. ZM-10482"
            aria-label="Ticket ID"
            className="h-12 w-full rounded-full border border-white/12 bg-white/[0.05] pr-4 pl-11 text-sm text-white outline-none transition-colors placeholder:text-white/35 focus:border-[#ff3d86]/70"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="zl-btn zl-btn-primary zl-btn-md shrink-0 disabled:opacity-70"
        >
          {loading ? <LuLoaderCircle className="size-4 animate-spin" /> : null}
          Check status
        </button>
      </form>
      {error && <p className="mt-2.5 text-sm text-[#ff6b8f]">{error}</p>}

      {result && (
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="min-w-0 truncate text-sm text-white/60">
              Ticket <span className="font-semibold text-white">{result}</span>
            </p>
            <span className="shrink-0 rounded-full bg-amber-400/15 px-2.5 py-1 text-xs font-semibold text-amber-300">
              In review
            </span>
          </div>
          <ol className="mt-5 grid grid-cols-3 gap-2">
            {STEPS.map((s, i) => {
              const done = i < 1;
              const current = i === 1;
              return (
                <li key={s} className="flex flex-col items-center gap-2 text-center">
                  <span
                    className={cn(
                      "flex size-8 items-center justify-center rounded-full border text-xs font-semibold",
                      done && "zl-grad-bg border-transparent text-white",
                      current && "border-[#ff3d86] text-white shadow-[0_0_0_4px_rgb(255_61_134/0.18)]",
                      !done && !current && "border-white/15 text-white/35"
                    )}
                  >
                    {done ? <LuCheck className="size-4" /> : i + 1}
                  </span>
                  <span className={cn("text-xs", current ? "font-semibold text-white" : "text-white/50")}>{s}</span>
                </li>
              );
            })}
          </ol>
          <p className="mt-5 text-sm leading-relaxed text-white/60">
            Our team is looking into your request. You will get an email as soon as there is an update.
          </p>
        </div>
      )}
    </div>
  );
}

"use client";

import * as React from "react";
import { LuArrowRight, LuLoaderCircle } from "react-icons/lu";
import { cn } from "@/lib/utils";

const STEPS = [
  { label: "Received", note: "We have your request." },
  { label: "In review", note: "Our team is looking into it." },
  { label: "Resolved", note: "You will get an email when it is done." },
];

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
      <form onSubmit={onSubmit} className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-5">
        <label className="min-w-0 flex-1">
          <span className="sr-only">Ticket ID</span>
          <input
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="ZM-10482"
            aria-label="Ticket ID"
            className="w-full border-b border-white/25 bg-transparent pb-3 font-heading text-xl text-white outline-none transition-colors placeholder:text-white/25 focus:border-[#ff3d86]"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="zl-btn zl-btn-primary zl-btn-md w-full shrink-0 disabled:opacity-70 sm:w-auto"
        >
          {loading ? (
            <LuLoaderCircle className="size-4 animate-spin" />
          ) : (
            <>
              Check status
              <LuArrowRight className="size-4" />
            </>
          )}
        </button>
      </form>
      {error && <p className="mt-3 text-sm text-[#ff6b8f]">{error}</p>}

      {result && (
        <div className="mt-7">
          <p className="flex items-baseline justify-between gap-4 text-xs uppercase tracking-[0.18em] text-white/45">
            <span className="min-w-0 truncate">
              Ticket <span className="font-semibold text-white">{result}</span>
            </span>
            <span className="shrink-0 font-semibold text-amber-300">In review</span>
          </p>
          <ol className="mt-5">
            {STEPS.map((s, i) => {
              const done = i < 1;
              const current = i === 1;
              return (
                <li key={s.label} className="relative flex gap-4 pb-5 last:pb-0">
                  {i < STEPS.length - 1 && (
                    <span
                      aria-hidden
                      className={cn("absolute top-5 left-[5px] h-[calc(100%-12px)] w-px", done ? "bg-[#ff3d86]" : "bg-white/15")}
                    />
                  )}
                  <span
                    aria-hidden
                    className={cn(
                      "relative mt-1 size-[11px] shrink-0 rounded-full",
                      done && "zl-grad-bg",
                      current && "bg-[#ff3d86] shadow-[0_0_0_5px_rgb(255_61_134/0.2)]",
                      !done && !current && "border border-white/30"
                    )}
                  />
                  <div>
                    <p className={cn("text-sm font-semibold leading-none", !done && !current && "text-white/45")}>{s.label}</p>
                    <p className={cn("mt-1.5 text-sm", current ? "text-white/70" : "text-white/40")}>{s.note}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </div>
  );
}

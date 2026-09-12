"use client";

import { toast } from "sonner";
import { FaFacebook, FaApple, FaGithub } from "react-icons/fa6";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20.5H24v7h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5-5C33.7 6.1 29.1 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="m6.3 14.7 5.7 4.2C13.6 15.1 18.4 12 24 12c3.1 0 5.8 1.1 8 3l5-5C33.7 6.1 29.1 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5 0 9.5-1.9 13-5l-6-5.1c-2 1.4-4.5 2.2-7 2.2-5.3 0-9.7-3.4-11.3-8l-6 4.6C9.6 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20.5H24v7h11.3c-.8 2.2-2.2 4.1-4.1 5.5l6 5.1C40.5 35.4 44 30.1 44 24c0-1.2-.1-2.4-.4-3.5z"
      />
    </svg>
  );
}

const providers = [
  { icon: GoogleIcon, label: "Google", colorClass: "" },
  { icon: FaFacebook, label: "Facebook", colorClass: "text-[#1877F2]" },
  { icon: FaApple, label: "Apple", colorClass: "" },
  { icon: FaGithub, label: "GitHub", colorClass: "" },
];

export function SocialAuthRow() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">Or continue with</span>
        <div className="h-px flex-1 bg-border" />
      </div>
      <div className="grid grid-cols-4 gap-2.5">
        {providers.map((p) => (
          <button
            key={p.label}
            type="button"
            aria-label={`Continue with ${p.label}`}
            onClick={() => toast.info(`${p.label} sign-in isn't set up yet.`)}
            className="flex h-11 items-center justify-center rounded-lg border bg-background transition-colors hover:bg-accent"
          >
            <p.icon className={`size-5 ${p.colorClass}`} />
          </button>
        ))}
      </div>
    </div>
  );
}

import { LandingNavbar } from "@/components/landing-navbar";
import { SiteFooter } from "@/components/site-footer";

const navLinks = [
  { label: "Music", href: "/#music" },
  { label: "Voice & Audio", href: "/#voice" },
  { label: "Video", href: "/#video" },
  { label: "Creator Tools", href: "/#creator-tools" },
  { label: "Pricing", href: "/#pricing" },
];

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <LandingNavbar navLinks={navLinks} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">{children}</main>
      <SiteFooter />
    </div>
  );
}

import { LandingNavbar } from "@/components/landing-navbar";
import { SiteFooter } from "@/components/site-footer";

const navLinks = [
  { label: "Features", href: "/#features" },
  { label: "MCN Checker", href: "/#mcn-checker" },
  { label: "Copyright Hub", href: "/#copyright-hub" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Support", href: "/#support" },
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

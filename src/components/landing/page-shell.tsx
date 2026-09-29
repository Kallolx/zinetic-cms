import { LandingNav } from "@/components/landing/nav";
import { SiteFooter } from "@/components/site-footer";
import { HeroScannerBg } from "@/components/hero-scanner-bg";
import { displayFont, serifFont } from "@/components/landing/fonts";

export function PageShell({
  children,
  effects = false,
}: {
  children: React.ReactNode;
  effects?: boolean;
}) {
  return (
    <div className={`zl ${displayFont.variable} ${serifFont.variable} relative min-h-screen overflow-x-clip`}>
      {effects && <SiteEffects />}
      <div aria-hidden className="zl-grain" />
      <LandingNav />
      <main className="relative z-10">{children}</main>
      <SiteFooter />
    </div>
  );
}

/** The animated scanner background and ambient glow, fixed behind the whole page */
export function SiteEffects() {
  return (
    <>
      <HeroScannerBg />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 opacity-40 dark:opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 50% at 50% -20%, oklch(0.55 0.25 15 / 35%), transparent 70%), radial-gradient(ellipse 60% 40% at 80% 80%, oklch(0.6 0.2 260 / 20%), transparent 70%)",
        }}
      />
    </>
  );
}

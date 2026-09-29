import { LandingNav } from "@/components/landing/nav";
import { SiteFooter } from "@/components/site-footer";
import { displayFont, serifFont } from "@/components/landing/fonts";

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className={`zl ${displayFont.variable} ${serifFont.variable} relative min-h-screen overflow-x-clip`}>
      <div aria-hidden className="zl-grain" />
      <LandingNav base="/" />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}

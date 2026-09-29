import { PageShell } from "@/components/landing/page-shell";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <PageShell effects>{children}</PageShell>;
}

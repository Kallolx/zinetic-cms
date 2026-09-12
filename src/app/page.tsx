import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { HeroScannerBg } from "@/components/hero-scanner-bg";
import { LandingNavbar } from "@/components/landing-navbar";
import {
  LuArrowRight,
  LuCircleCheck,
  LuSearch,
  LuMail,
  LuShieldCheck,
  LuChartBar,
  LuCheck,
  LuCircleHelp,
  LuMapPin,
  LuPhone,
} from "react-icons/lu";
import {
  FaFacebookF,
  FaWhatsapp,
  FaLinkedinIn,
  FaYoutube,
  FaInstagram,
  FaXTwitter,
  FaSoundcloud,
  FaSpotify,
  FaTiktok,
  FaStar,
} from "react-icons/fa6";

export const dynamic = "force-dynamic";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "MCN Checker", href: "#mcn-checker" },
  { label: "Copyright Hub", href: "#copyright-hub" },
  { label: "Pricing", href: "#pricing" },
  { label: "Support", href: "#support" },
];

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground scroll-smooth">
      {/* Fixed Scanner WebGL Animated Background locked across the entire site */}
      <HeroScannerBg />

      {/* Fixed Ambient Glow Overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-40 dark:opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 50% at 50% -20%, oklch(0.55 0.25 15 / 35%), transparent 70%), radial-gradient(ellipse 60% 40% at 80% 80%, oklch(0.6 0.2 260 / 20%), transparent 70%)",
        }}
      />

      {/* Header / Navbar */}
      <LandingNavbar navLinks={navLinks} />

      {/* Hero Section */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-16 sm:py-24">
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-primary shadow-sm backdrop-blur-md">
            <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="none">
              <path
                d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"
                fill="#FF0000"
              />
              <polygon points="9.545,15.568 15.818,12 9.545,8.432" fill="#FFFFFF" />
            </svg>
            <span>YouTube MCN &amp; Copyright Hub</span>
          </div>

          {/* Heading */}
          <h1 className="font-heading text-4xl font-extrabold tracking-tight sm:text-6xl sm:leading-[1.15]">
            Instantly Check Networks &amp; Manage{" "}
            <span className="bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 bg-clip-text text-transparent">
              YouTube Copyright
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            Uncover channel network ownership in seconds, retrieve direct MCN contact emails, and streamline copyright claim workflows in one unified dashboard.
          </p>

          {/* Action Buttons */}
          <div className="mt-8 flex justify-center">
            <Button
              size="lg"
              className="h-12 px-8 text-base shadow-lg shadow-primary/20"
              nativeButton={false}
              render={
                <Link href="/login" className="flex items-center gap-2 font-semibold">
                  <span>Sign in to Dashboard</span>
                  <LuArrowRight className="size-5" />
                </Link>
              }
            />
          </div>

          {/* Feature Badges */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <LuCircleCheck className="size-4 text-emerald-500" />
              <span>Instant MCN Lookup</span>
            </div>
            <div className="flex items-center gap-2">
              <LuCircleCheck className="size-4 text-emerald-500" />
              <span>Verified Contact Emails</span>
            </div>
            <div className="flex items-center gap-2">
              <LuCircleCheck className="size-4 text-emerald-500" />
              <span>Copyright Claim Tracking</span>
            </div>
          </div>
        </div>
      </main>

      {/* Section 1: Features */}
      <section id="features" className="relative z-10 py-20 px-6 bg-transparent">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              Everything You Need for YouTube Management
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              Designed for creators, record labels, and copyright managers to audit networks and handle content rights effortlessly.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-border/50 bg-card/70 backdrop-blur-md p-6 shadow-sm">
              <div className="flex size-12 items-center justify-center rounded-xl bg-red-500/10 text-red-500 mb-4">
                <LuSearch className="size-6" />
              </div>
              <h3 className="font-heading text-lg font-semibold">MCN Channel Lookup</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Find out which Multi-Channel Network (MCN) any YouTube channel belongs to in seconds.
              </p>
            </div>

            <div className="rounded-2xl border border-border/50 bg-card/70 backdrop-blur-md p-6 shadow-sm">
              <div className="flex size-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 mb-4">
                <LuMail className="size-6" />
              </div>
              <h3 className="font-heading text-lg font-semibold">Direct Contact Emails</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Retrieve verified MCN contact email addresses to resolve copyright issues directly.
              </p>
            </div>

            <div className="rounded-2xl border border-border/50 bg-card/70 backdrop-blur-md p-6 shadow-sm">
              <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 mb-4">
                <LuShieldCheck className="size-6" />
              </div>
              <h3 className="font-heading text-lg font-semibold">Claim Management</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Submit claim release requests and monitor claim status across channels seamlessly.
              </p>
            </div>

            <div className="rounded-2xl border border-border/50 bg-card/70 backdrop-blur-md p-6 shadow-sm">
              <div className="flex size-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 mb-4">
                <LuChartBar className="size-6" />
              </div>
              <h3 className="font-heading text-lg font-semibold">Audit &amp; Wallet History</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Keep track of every check, claim request, and transaction in a unified history.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: MCN Checker */}
      <section id="mcn-checker" className="relative z-10 py-20 px-6 bg-transparent">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-4">
                Smart Diagnostics
              </div>
              <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
                Lightning Fast MCN &amp; Network Identification
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed text-lg">
                No more manual digging through YouTube pages. Simply input the channel link or handle, and our system retrieves exact MCN partner data instantly.
              </p>
              
              <ul className="mt-6 flex flex-col gap-4">
                <li className="flex items-start gap-3">
                  <LuCircleCheck className="size-5 text-emerald-500 mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">Supports custom URLs, handles (@username), and channel IDs.</span>
                </li>
                <li className="flex items-start gap-3">
                  <LuCircleCheck className="size-5 text-emerald-500 mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">Automated contact email extraction for quick communication.</span>
                </li>
                <li className="flex items-start gap-3">
                  <LuCircleCheck className="size-5 text-emerald-500 mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">Persistent search history saved directly to your user account.</span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border bg-card p-6 shadow-xl space-y-4">
              <div className="rounded-xl border bg-muted/50 p-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Step 1</div>
                <div className="font-medium text-foreground">Paste YouTube Channel URL</div>
              </div>
              <div className="rounded-xl border bg-muted/50 p-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Step 2</div>
                <div className="font-medium text-foreground">System Checks MCN Network Database</div>
              </div>
              <div className="rounded-xl border p-4 border-emerald-500/30 bg-emerald-500/10">
                <div className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">Step 3</div>
                <div className="font-medium text-foreground">Instant MCN Match &amp; Verified Contact Email Revealed</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Copyright Hub */}
      <section id="copyright-hub" className="relative z-10 py-20 px-6 bg-transparent">
        <div className="mx-auto max-w-7xl text-center">
          <div className="max-w-3xl mx-auto mb-16">
            <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              Unified Copyright &amp; Rights Hub
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              Manage video release requests, track copyright issues, and monitor status updates without leaving the portal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <h3 className="font-heading text-lg font-semibold">Release Claim Requests</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Submit claims directly to partner networks to quickly release video strikes and revenue holds.
              </p>
            </div>

            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <h3 className="font-heading text-lg font-semibold">Issue Dispute Tracker</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Stay updated on ongoing disputes with real-time status indicators and admin review logs.
              </p>
            </div>

            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <h3 className="font-heading text-lg font-semibold">Claimed Video Management</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Organize and filter all claimed assets in one structured overview with built-in export tools.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Pricing */}
      <section id="pricing" className="relative z-10 py-20 px-6 bg-transparent">
        <div className="mx-auto max-w-7xl text-center">
          <div className="max-w-3xl mx-auto mb-16">
            <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              Simple &amp; Transparent Pricing
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              Choose the credit plan that best fits your channel audit and copyright management volume.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Pro Plan */}
            <div className="rounded-2xl border-2 border-primary bg-card p-8 flex flex-col justify-between text-left relative shadow-lg">
              <div className="absolute -top-3 right-6 rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-primary-foreground">
                Popular
              </div>
              <div>
                <h3 className="font-heading text-xl font-bold">Pro Manager</h3>
                <p className="text-sm text-muted-foreground mt-1">For digital rights agencies</p>
                <div className="mt-4 text-3xl font-extrabold">Pay Per Check <span className="text-sm font-normal text-muted-foreground">/ credit</span></div>
                <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2"><LuCheck className="size-4 text-emerald-500" /> Full MCN Channel Lookup</li>
                  <li className="flex items-center gap-2"><LuCheck className="size-4 text-emerald-500" /> Verified Contact Email Retrieval</li>
                  <li className="flex items-center gap-2"><LuCheck className="size-4 text-emerald-500" /> Claim Release Submissions</li>
                  <li className="flex items-center gap-2"><LuCheck className="size-4 text-emerald-500" /> Priority Support</li>
                </ul>
              </div>
              <Button className="mt-8 w-full" nativeButton={false} render={<Link href="/register">Start Pro Trial</Link>} />
            </div>

            {/* Enterprise Plan */}
            <div className="rounded-2xl border bg-card p-8 flex flex-col justify-between text-left shadow-sm">
              <div>
                <h3 className="font-heading text-xl font-bold">Enterprise</h3>
                <p className="text-sm text-muted-foreground mt-1">Custom volume solutions</p>
                <div className="mt-4 text-3xl font-extrabold">Custom <span className="text-sm font-normal text-muted-foreground">pricing</span></div>
                <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2"><LuCheck className="size-4 text-emerald-500" /> Unlimited Bulk Checks</li>
                  <li className="flex items-center gap-2"><LuCheck className="size-4 text-emerald-500" /> Dedicated Account Manager</li>
                  <li className="flex items-center gap-2"><LuCheck className="size-4 text-emerald-500" /> API Access</li>
                </ul>
              </div>
              <Button variant="outline" className="mt-8 w-full" nativeButton={false} render={<Link href="/login">Contact Us</Link>} />
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Support / FAQ */}
      <section id="support" className="relative z-10 py-20 px-6 bg-transparent">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-12">
            <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              Frequently Asked Questions &amp; Support
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              Have questions about MCN checks or copyright claims? We&apos;re here to help.
            </p>
          </div>

          <div className="space-y-4 text-left">
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <LuCircleHelp className="size-5 text-primary shrink-0" />
                How accurate is the MCN channel check?
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed pl-7">
                Our system queries real-time YouTube partner records to verify channel MCN status and contact details.
              </p>
            </div>

            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <LuCircleHelp className="size-5 text-primary shrink-0" />
                How does wallet balance and credits work?
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed pl-7">
                Credits are deducted automatically per lookup or claim request. You can top up your wallet anytime from your dashboard.
              </p>
            </div>

            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <LuCircleHelp className="size-5 text-primary shrink-0" />
                Who can register for an account?
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed pl-7">
                Registrations are open for creators and agencies. Admin approval ensures verified and secure platform access.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Styled Footer matching user reference image */}
      <footer className="relative z-10 border-t border-neutral-800 bg-[#080808] text-white pt-16 pb-8 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
            {/* Column 1: Brand Info (4 cols) */}
            <div className="space-y-6 lg:col-span-3">
              <Logo size={36} />
              <p className="text-sm leading-relaxed text-neutral-400 max-w-sm">
                YouTube MCN Checker &amp; Copyright Management portal built for creators, record labels, and digital rights managers.
              </p>
              <div className="flex items-center gap-3">
                <a href="#" className="flex size-10 items-center justify-center rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white">
                  <FaFacebookF className="size-4" />
                </a>
                <a href="#" className="flex size-10 items-center justify-center rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white">
                  <FaWhatsapp className="size-4" />
                </a>
                <a href="#" className="flex size-10 items-center justify-center rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white">
                  <FaLinkedinIn className="size-4" />
                </a>
                <a href="#" className="flex size-10 items-center justify-center rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white">
                  <FaYoutube className="size-4" />
                </a>
              </div>
            </div>

            {/* Column 2: Quick Links (2 cols) */}
            <div className="lg:col-span-2">
              <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-white mb-5">QUICK LINKS</h4>
              <ul className="space-y-3 text-sm text-neutral-400">
                <li><a href="#mcn-checker" className="hover:text-white transition-colors">MCN Checker</a></li>
                <li><a href="#copyright-hub" className="hover:text-white transition-colors">Copyright Hub</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#support" className="hover:text-white transition-colors">Support</a></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Sign In</Link></li>
              </ul>
            </div>

            {/* Column 2b: Legal (1 col) */}
            <div className="lg:col-span-1">
              <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-white mb-5">LEGAL</h4>
              <ul className="space-y-3 text-sm text-neutral-400">
                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms &amp; Conditions</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/refund-policy" className="hover:text-white transition-colors">Refund Policy</Link></li>
              </ul>
            </div>

            {/* Column 3: United Kingdom (3 cols) */}
            <div className="lg:col-span-3">
              <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-white mb-5 flex items-center gap-2">
                <span>🇬🇧</span> UNITED KINGDOM
              </h4>
              <ul className="space-y-3.5 text-sm text-neutral-400">
                <li className="flex items-start gap-3">
                  <LuMapPin className="size-4 mt-0.5 shrink-0 text-neutral-500" />
                  <span>71-75 Shelton Street, Covent Garden, London, WC2H 9JQ</span>
                </li>
                <li className="flex items-center gap-3">
                  <LuPhone className="size-4 shrink-0 text-neutral-500" />
                  <span>+44 7307 601 744</span>
                </li>
                <li className="flex items-center gap-3">
                  <LuMail className="size-4 shrink-0 text-neutral-500" />
                  <a href="mailto:contact@zineticmusic.com" className="hover:text-white transition-colors">contact@zineticmusic.com</a>
                </li>
              </ul>
            </div>

            {/* Column 4: Bangladesh (3 cols) */}
            <div className="lg:col-span-3">
              <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-white mb-5 flex items-center gap-2">
                <span>🇧🇩</span> BANGLADESH
              </h4>
              <ul className="space-y-3.5 text-sm text-neutral-400">
                <li className="flex items-start gap-3">
                  <LuMapPin className="size-4 mt-0.5 shrink-0 text-neutral-500" />
                  <span>Batar Goli, Boro Moghbazar, Ramna, Dhaka, 1217</span>
                </li>
                <li className="flex items-center gap-3">
                  <LuPhone className="size-4 shrink-0 text-neutral-500" />
                  <span>+880 9696 797 267</span>
                </li>
                <li className="flex items-center gap-3">
                  <LuMail className="size-4 shrink-0 text-neutral-500" />
                  <a href="mailto:info@zineticmusic.com" className="hover:text-white transition-colors">info@zineticmusic.com</a>
                </li>
              </ul>
            </div>
          </div>

          {/* Payment methods */}
          <div className="mt-12 border-t border-neutral-900 pt-8">
            <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-white mb-4">
              WE ACCEPT
            </h4>
            {/* TODO: replace with the payment banner image provided by the client (attached to their SSLCommerz onboarding email) */}
            <div className="flex h-14 w-full max-w-md items-center justify-center rounded-lg border border-dashed border-neutral-700 bg-neutral-900/50 text-xs text-neutral-500">
              Payment banner image pending
            </div>
          </div>

          {/* Bottom Row Bar */}
          <div className="mt-8 border-t border-neutral-900 pt-8 flex flex-col lg:flex-row items-center justify-between gap-6 text-xs text-neutral-500">
            <div className="flex flex-col gap-1.5">
              <div>
                © Copyright 2026 | Zinetic Music Limited | All Right Reserved |{" "}
                <Link href="/privacy" className="hover:text-neutral-300">Privacy Policy</Link> |{" "}
                <Link href="/terms" className="hover:text-neutral-300">Terms and Conditions</Link> |{" "}
                <Link href="/refund-policy" className="hover:text-neutral-300">Refund Policy</Link> |{" "}
                <Link href="/about" className="hover:text-neutral-300">About Us</Link>
              </div>
              <div className="text-neutral-600">
                Trade License No.: [to be added] &middot; TIN: [to be added]
              </div>
            </div>

            <div className="flex items-center gap-6">
              {/* Trustpilot Branding */}
              <div className="flex items-center gap-1.5 font-bold text-white text-sm">
                <FaStar className="size-4 text-[#00b67a] fill-[#00b67a]" />
                <span>Trustpilot</span>
              </div>

              {/* Small Circular Social Icons */}
              <div className="flex items-center gap-2">
                <a href="#" className="flex size-7 items-center justify-center rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-colors">
                  <FaInstagram className="size-3.5" />
                </a>
                <a href="#" className="flex size-7 items-center justify-center rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-colors">
                  <FaXTwitter className="size-3.5" />
                </a>
                <a href="#" className="flex size-7 items-center justify-center rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-colors">
                  <FaSoundcloud className="size-3.5" />
                </a>
                <a href="#" className="flex size-7 items-center justify-center rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-colors">
                  <FaSpotify className="size-3.5" />
                </a>
                <a href="#" className="flex size-7 items-center justify-center rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-colors">
                  <FaTiktok className="size-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

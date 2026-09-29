import Image from "next/image";
import Link from "next/link";
import { LuArrowUpRight, LuPlus } from "react-icons/lu";
import { Reveal, SectionHeading } from "@/components/landing/primitives";
import { MEDIA } from "@/lib/landing-services";

const STEPS = [
  {
    n: "01",
    title: "Pick a service",
    body: "Choose from 17 tools across music, voice, video and creator tools, and the plan that fits how much you make.",
  },
  {
    n: "02",
    title: "Pay securely",
    body: "Check out in BDT through SSLCommerz with bKash, Nagad, Rocket or card. Your plan is added to your account the moment payment clears.",
  },
  {
    n: "03",
    title: "Create and download",
    body: "Generate, translate, dub or release from your dashboard, then download your files. Usage only counts when a job succeeds.",
  },
];

const FAQ = [
  {
    q: "Do failed generations use up my plan?",
    a: "No. Usage is only deducted after a generation or job completes successfully. If something fails, your credits, minutes or characters stay in your account.",
  },
  {
    q: "How much of my royalties do I keep with Music Distribution?",
    a: "80% on the Artist plan, 85% on Pro and 90% on Label. Every plan includes unlimited releases and monthly royalty reports.",
  },
  {
    q: "How do I pay?",
    a: "All plans are paid through SSLCommerz, Bangladesh's secure payment gateway. Prices are shown in USD and charged in BDT at checkout, using bKash, Nagad, Rocket or a debit/credit card.",
  },
  {
    q: "What is a Credit in Creator Tools?",
    a: "1 Credit is one MCN / CMS channel check. Buy a single check or a bundle of credits at a lower price per check. Credits don't expire.",
  },
  {
    q: "Can I get a refund?",
    a: "Yes, under our Return and Refund Policy. Approved refunds are returned to your original payment method within 7 to 10 working days.",
  },
  {
    q: "Where can I see what I've bought and used?",
    a: "Your dashboard shows your active plans, remaining usage, generated files, order and payment history, transaction IDs and renewal dates.",
  },
];

export function HowItWorks() {
  return (
    <section className="px-5 py-24 sm:py-32">
      <SectionHeading eyebrow="How it works" title="From idea to download in three steps." />
      <div className="mx-auto mt-16 grid max-w-7xl gap-px overflow-hidden rounded-[28px] border border-(--zl-line) bg-(--zl-line) md:grid-cols-3">
        {STEPS.map((s, i) => (
          <Reveal key={s.n} delay={i * 0.1} className="bg-(--zl-surface)">
            <div className="flex h-full flex-col p-8 sm:p-10">
              <span className="zl-display zl-grad-text text-6xl font-bold">{s.n}</span>
              <h3 className="zl-display mt-8 text-3xl font-semibold">{s.title}</h3>
              <p className="mt-3 leading-relaxed text-(--zl-muted)">{s.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function Faq() {
  return (
    <section id="faq" className="scroll-mt-24 px-5 py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_1.5fr]">
        <SectionHeading
          align="left"
          eyebrow="Questions"
          title={
            <>
              Good to <span className="zl-serif zl-grad-text">know.</span>
            </>
          }
          sub={
            <>
              Something else on your mind? Write to us from the{" "}
              <Link href="/contact" className="underline underline-offset-4">
                Contact page
              </Link>
              .
            </>
          }
        />
        <Reveal delay={0.1} className="flex flex-col">
          {FAQ.map((item) => (
            <details key={item.q} className="group border-b border-(--zl-line) py-6 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-lg font-semibold sm:text-xl">
                {item.q}
                <LuPlus className="size-5 shrink-0 text-(--zl-muted) transition-transform duration-300 group-open:rotate-45" />
              </summary>
              <p className="mt-4 max-w-2xl leading-relaxed text-(--zl-muted)">{item.a}</p>
            </details>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section className="px-5 pt-12 pb-24 sm:pb-32">
      <Reveal className="mx-auto max-w-7xl">
        <div className="relative isolate overflow-hidden rounded-[36px] px-6 py-24 text-center text-white sm:py-32">
          <Image src={MEDIA.crowdPurple} alt="" fill sizes="100vw" className="-z-20 object-cover" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/60 via-black/55 to-black/85" />
          <div className="absolute left-1/2 top-full -z-10 h-[60%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ff3d86]/40 blur-[100px]" />
          <h2 className="zl-display mx-auto max-w-4xl text-[clamp(2.8rem,8vw,7rem)] font-bold">
            Your next release <span className="zl-serif">starts here.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-white/75">
            One account for distribution, AI voice, AI video and creator tools.
          </p>
          <Link
            href="/register"
            className="group mt-10 inline-flex items-center gap-2 rounded-full bg-white px-7 py-4 text-base font-semibold text-black transition-transform hover:scale-[1.03]"
          >
            Create your free account
            <LuArrowUpRight className="size-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </Reveal>
    </section>
  );
}

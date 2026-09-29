import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LuArrowLeft, LuCheck } from "react-icons/lu";
import { PageHero } from "@/components/landing/page-parts";
import { AutoVideo, Reveal, SectionHeading } from "@/components/landing/primitives";
import { ServiceCard, ServiceFaq, TierCards } from "@/components/landing/service-parts";
import { ZButton } from "@/components/landing/button";
import { FinalCta } from "@/components/landing/closing";
import { CATEGORIES, SERVICES } from "@/lib/landing-services";
import { SERVICE_PAGES, fromPrice, getService } from "@/lib/service-pages";

export function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return {};
  return {
    title: `${service.name} | Zinetic Music`,
    description: `${SERVICE_PAGES[slug].tagline} ${service.blurb}`,
  };
}

function splitName(name: string) {
  const words = name.split(" ");
  if (words.length < 2) return { head: "", tail: name };
  return { head: words.slice(0, -1).join(" ") + " ", tail: words[words.length - 1] };
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();
  const page = SERVICE_PAGES[slug];
  const category = CATEGORIES.find((c) => c.id === service.category)!;
  const { head, tail } = splitName(service.name);

  const related = [
    ...SERVICES.filter((s) => s.category === service.category && s.id !== service.id),
    ...SERVICES.filter((s) => s.category !== service.category),
  ].slice(0, 3);

  return (
    <>
      <PageHero
        eyebrow={category.label}
        title={
          <>
            {head}
            <span className="zl-serif zl-grad-text">{tail}</span>
          </>
        }
        sub={<span className="text-(--zl-text)/90">{page.tagline}</span>}
        meta={
          <div className="flex flex-wrap items-center gap-3">
            <ZButton href="/client-login" size="lg">
              {service.cta}
            </ZButton>
            <ZButton href="#plans" variant="outline" size="lg" arrow={false}>
              See pricing
            </ZButton>
            <span className="text-sm text-(--zl-muted)">{fromPrice(service)}</span>
          </div>
        }
        aside={
          <div className="relative mx-auto aspect-[4/3] w-full max-w-[560px] overflow-hidden rounded-[30px] border border-(--zl-line) shadow-[0_40px_100px_-40px_rgb(0_0_0/0.7)]">
            <AutoVideo src={page.hero} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute inset-x-4 bottom-4 flex flex-wrap gap-2">
              {service.features.slice(0, 3).map((f) => (
                <span
                  key={f}
                  className="rounded-full bg-black/50 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md"
                >
                  {f}
                </span>
              ))}
            </div>
          </div>
        }
      />

      <section className="px-5 pb-6">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-sm font-medium text-(--zl-muted) transition-colors hover:text-(--zl-text)"
          >
            <LuArrowLeft className="size-4" /> All services
          </Link>
        </div>
      </section>

      <section className="px-5 py-16 sm:py-24">
        <SectionHeading
          eyebrow="What you get"
          title={
            <>
              Everything included, <span className="zl-serif zl-grad-text">nothing extra.</span>
            </>
          }
        />
        <div className="mx-auto mt-12 grid max-w-5xl gap-4 sm:grid-cols-2">
          {service.features.map((f, i) => (
            <Reveal key={f} delay={i * 0.05} className="min-w-0">
              <div className="flex items-center gap-4 rounded-2xl border border-(--zl-line) bg-(--zl-surface) px-5 py-4">
                <span className="zl-grad-bg flex size-9 shrink-0 items-center justify-center rounded-full text-white">
                  <LuCheck className="size-4" />
                </span>
                <span className="font-medium">{f}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="px-5 py-16 sm:py-24">
        <SectionHeading eyebrow="How it works" title="Three steps, start to finish." />
        <div className="mx-auto mt-14 grid max-w-7xl gap-px overflow-hidden rounded-[28px] border border-(--zl-line) bg-(--zl-line) md:grid-cols-3">
          {page.steps.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.1} className="min-w-0 bg-(--zl-surface)">
              <div className="flex h-full flex-col p-8 sm:p-10">
                <span className="zl-display zl-grad-text text-6xl font-bold">0{i + 1}</span>
                <h3 className="zl-display mt-8 text-2xl font-semibold">{s.title}</h3>
                <p className="mt-3 leading-relaxed text-(--zl-muted)">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="plans" className="scroll-mt-28 px-5 py-16 sm:py-24">
        <SectionHeading
          eyebrow="Pricing"
          title={
            <>
              Clear prices. <span className="zl-serif zl-grad-text">No surprises.</span>
            </>
          }
          sub="Paid through secure SSLCommerz checkout. Prices are in USD and charged in BDT."
        />
        <div className="mx-auto mt-14 max-w-7xl">
          <TierCards service={service} />
        </div>
      </section>

      <section className="px-5 py-16 sm:py-24">
        <SectionHeading eyebrow="Made for" title="Who it helps." />
        <div className="mx-auto mt-14 grid max-w-7xl gap-5 md:grid-cols-3">
          {page.useCases.map((u, i) => (
            <Reveal key={u.title} delay={i * 0.08} className="min-w-0">
              <div className="h-full rounded-[26px] border border-(--zl-line) bg-(--zl-surface) p-7">
                <h3 className="zl-display text-xl font-semibold">{u.title}</h3>
                <p className="mt-3 leading-relaxed text-(--zl-muted)">{u.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="px-5 py-16 sm:py-24">
        <SectionHeading eyebrow="Questions" title="Good to know." />
        <div className="mt-12">
          <ServiceFaq />
        </div>
      </section>

      <section className="px-5 py-16 sm:py-24">
        <SectionHeading eyebrow="Keep exploring" title="More from Zinetic." />
        <div className="mx-auto mt-14 grid max-w-7xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((s, i) => (
            <ServiceCard key={s.id} service={s} delay={i * 0.08} />
          ))}
        </div>
      </section>

      <FinalCta />
    </>
  );
}

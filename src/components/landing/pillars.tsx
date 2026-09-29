import Image from "next/image";
import { LuArrowUpRight } from "react-icons/lu";
import { AutoVideo, Reveal, SectionHeading } from "@/components/landing/primitives";
import { MEDIA, servicesIn, type ServiceCategory } from "@/lib/landing-services";

const PILLARS: {
  id: ServiceCategory;
  anchor: string;
  title: string;
  line: string;
  media: { kind: "video" | "image"; src: string };
  tags?: string[];
}[] = [
  { id: "music", anchor: "#music", title: "Music", line: "Release it. Or make it from a prompt.", media: { kind: "video", src: MEDIA.guitar }, tags: ["Music Distribution", "Music Generator", "Unlimited releases", "Worldwide reach", "Major streaming platforms", "Analytics dashboard", "Monthly royalty reports", "Up to 90% royalties", "Prompt-to-music", "Vocals & instrumentals"] },
  { id: "voice", anchor: "#voice", title: "AI Voice & Audio", line: "Voices, dubs, effects and clean sound.", media: { kind: "video", src: MEDIA.studioSinger } },
  { id: "video", anchor: "#video", title: "AI Video", line: "Avatars, translation, lip sync and clips.", media: { kind: "video", src: MEDIA.greenPresenterB } },
  { id: "creator", anchor: "#creator-tools", title: "Creator Tools", line: "Know who owns any YouTube channel.", media: { kind: "video", src: MEDIA.videoEditing }, tags: ["MCN / CMS Checking", "Network ownership", "Network contact email", "Instant results", "Credit bundles", "Credits never expire", "YouTube channel lookup"] },
];

export function Pillars() {
  return (
    <section className="px-5 py-24 sm:py-32">
      <SectionHeading
        eyebrow="17 services, 4 studios"
        title={
          <>
            Everything a creator needs.
            <br />
            <span className="zl-serif zl-grad-text">Nothing they don&apos;t.</span>
          </>
        }
      />
      <div className="mx-auto mt-16 grid max-w-7xl gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {PILLARS.map((p, i) => {
          const services = servicesIn(p.id);
          return (
            <Reveal key={p.id} delay={i * 0.08}>
              <a
                href={p.anchor}
                className="group flex h-full flex-col overflow-hidden rounded-[28px] border border-(--zl-line) bg-(--zl-surface) transition-colors hover:border-(--zl-text)/25"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  {p.media.kind === "video" ? (
                    <AutoVideo src={p.media.src} className="transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    <Image
                      src={p.media.src}
                      alt=""
                      fill
                      sizes="(min-width:1024px) 25vw, 50vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  )}
                  <span className="absolute top-4 right-4 rounded-full bg-black/40 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
                    {services.length} {services.length === 1 ? "tool" : "tools"}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="zl-display text-2xl font-semibold">{p.title}</h3>
                    <LuArrowUpRight className="mt-1 size-5 shrink-0 text-(--zl-muted) transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-(--zl-text)" />
                  </div>
                  <p className="mt-1.5 text-sm text-(--zl-muted)">{p.line}</p>
                  <ul className="mt-6 flex flex-wrap gap-1.5">
                    {(p.tags ?? services.map((s) => s.name.replace(/^AI /, ""))).map((t) => (
                      <li
                        key={t}
                        className="rounded-full border border-(--zl-line) px-2.5 py-1 text-xs text-(--zl-muted)"
                      >
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </a>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

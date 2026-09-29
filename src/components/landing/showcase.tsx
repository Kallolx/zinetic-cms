import Image from "next/image";
import { LuPlay } from "react-icons/lu";
import { AutoVideo, SectionHeading } from "@/components/landing/primitives";
import { MEDIA } from "@/lib/landing-services";

const ITEMS: { kind: "video" | "image"; src: string; service: string; detail: string }[] = [
  { kind: "video", src: MEDIA.neonSinger, service: "AI Music Generator", detail: "Synth-pop, female vocal, 118 BPM" },
  { kind: "video", src: MEDIA.manTalking, service: "AI Video Translation", detail: "English to Bangla, original voice" },
  { kind: "image", src: MEDIA.purpleStage, service: "Music Distribution", detail: "One release, every major store" },
  { kind: "video", src: MEDIA.headphonesCloseUp, service: "AI Lip Sync", detail: "New vocal, perfectly matched" },
  { kind: "image", src: MEDIA.portraitCloseUp, service: "AI Avatar Creator", detail: "Your face, reusable in any video" },
  { kind: "video", src: MEDIA.studioVocalist, service: "AI Voice Cleaner", detail: "Room noise out, voice isolated" },
  { kind: "image", src: MEDIA.blueGuitarist, service: "AI Dubbing", detail: "Keeps timing and emotion" },
  { kind: "video", src: MEDIA.smilingSinger, service: "AI Voice Changer", detail: "Same take, a different voice" },
];

function ShowcaseCard({ item }: { item: (typeof ITEMS)[number] }) {
  return (
    <figure className="group relative h-[420px] w-[270px] shrink-0 overflow-hidden rounded-[26px] border border-(--zl-line) bg-(--zl-surface) sm:h-[480px] sm:w-[310px]">
      {item.kind === "video" ? (
        <AutoVideo src={item.src} className="transition-transform duration-700 group-hover:scale-105" />
      ) : (
        <Image
          src={item.src}
          alt=""
          fill
          sizes="310px"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/20" />
      <span className="absolute top-4 left-4 flex size-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition-transform group-hover:scale-110">
        <LuPlay className="size-4 translate-x-[1px] fill-white" />
      </span>
      <figcaption className="absolute inset-x-0 bottom-0 p-5 text-white">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-white/60">{item.service}</p>
        <p className="zl-display mt-2 text-2xl font-semibold leading-tight">{item.detail}</p>
      </figcaption>
    </figure>
  );
}

export function Showcase() {
  const loop = [...ITEMS, ...ITEMS];
  return (
    <section className="relative py-24 sm:py-32">
      <SectionHeading
        eyebrow="Made with Zinetic"
        title={
          <>
            Studio results, <span className="zl-serif zl-grad-text">without the studio.</span>
          </>
        }
        sub="Songs, voices, dubs and videos that are ready to publish, not rough demos you still have to fix."
        className="px-5"
      />
      <div
        className="zl-marquee-paused relative mt-16 overflow-hidden"
        style={{ maskImage: "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)" }}
      >
        <div className="zl-marquee flex w-max gap-5 px-5" style={{ ["--zl-marquee-duration" as string]: "70s" }}>
          {loop.map((item, i) => (
            <ShowcaseCard key={i} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}

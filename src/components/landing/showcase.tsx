import Image from "next/image";
import { LuPlay } from "react-icons/lu";
import { AutoVideo, SectionHeading } from "@/components/landing/primitives";
import { MEDIA } from "@/lib/landing-services";
import { cn } from "@/lib/utils";

type Item = { kind: "video" | "image"; src: string; service: string; detail: string };

const ROW_ONE: Item[] = [
  { kind: "video", src: MEDIA.neonShades, service: "AI Music Generator", detail: "Synth-pop, female vocal, 118 BPM" },
  { kind: "video", src: MEDIA.greenPresenterB, service: "AI Video Translation", detail: "English to Bangla, original voice" },
  { kind: "video", src: MEDIA.bandStage, service: "Music Distribution", detail: "One release, every major store" },
  { kind: "video", src: MEDIA.headphonesCloseUp, service: "AI Lip Sync", detail: "New vocal, perfectly matched" },
  { kind: "video", src: MEDIA.presenterWoman, service: "AI Avatar Video", detail: "Your script, presented on camera" },
  { kind: "video", src: MEDIA.studioSinger, service: "AI Voice Cleaner", detail: "Room noise out, voice isolated" },
  { kind: "video", src: MEDIA.piano, service: "AI Music Generator", detail: "Piano ballad, no vocals" },
  { kind: "video", src: MEDIA.smilingHeadphones, service: "AI Voice Changer", detail: "Same take, a different voice" },
];

const ROW_TWO: Item[] = [
  { kind: "video", src: MEDIA.videoEditing, service: "AI Short Clip Generator", detail: "42 minutes in, 3 Shorts out" },
  { kind: "video", src: MEDIA.djHands, service: "AI Sound Effects", detail: "Cinematic hits and clean loops" },
  { kind: "video", src: MEDIA.podcastA, service: "Speech to Text", detail: "Speakers and timestamps, labelled" },
  { kind: "video", src: MEDIA.guitar, service: "Music Distribution", detail: "Unlimited releases, one price" },
  { kind: "video", src: MEDIA.greenMan, service: "AI Dubbing", detail: "Keeps timing and emotion" },
  { kind: "video", src: MEDIA.neonDancer, service: "AI Prompt to Video", detail: "Neon dance floor, slow push-in" },
  { kind: "video", src: MEDIA.micClose, service: "AI Voice Generator", detail: "A script read in a warm voice" },
  { kind: "video", src: MEDIA.ringLight, service: "AI Avatar Creator", detail: "Your face, reusable in any video" },
  { kind: "video", src: MEDIA.drummer, service: "AI Music Generator", detail: "Live drums, 96 BPM" },
];

function ShowcaseCard({ item, compact }: { item: Item; compact?: boolean }) {
  return (
    <figure
      className={cn(
        "group relative shrink-0 overflow-hidden border border-(--zl-line) bg-(--zl-surface)",
        compact
          ? "h-[200px] w-[330px] rounded-[22px] sm:h-[230px] sm:w-[400px]"
          : "h-[380px] w-[250px] rounded-[24px] sm:h-[420px] sm:w-[280px]"
      )}
    >
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
      <figcaption className="absolute inset-x-0 bottom-0 p-4 text-white">
        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-white/60">{item.service}</p>
        <p className="mt-1.5 text-[0.95rem] font-medium leading-snug text-white/95">{item.detail}</p>
      </figcaption>
    </figure>
  );
}

function Row({
  items,
  compact,
  reverse,
  duration,
}: {
  items: Item[];
  compact?: boolean;
  reverse?: boolean;
  duration: string;
}) {
  const loop = [...items, ...items];
  return (
    <div
      className="zl-marquee-paused relative overflow-hidden"
      style={{ maskImage: "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)" }}
    >
      <div
        className={cn("zl-marquee flex w-max gap-5 px-2.5", reverse && "zl-marquee-reverse")}
        style={{ ["--zl-marquee-duration" as string]: duration }}
      >
        {loop.map((item, i) => (
          <ShowcaseCard key={i} item={item} compact={compact} />
        ))}
      </div>
    </div>
  );
}

export function Showcase() {
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
      <div className="mt-16 flex flex-col gap-5">
        <Row items={ROW_ONE} duration="80s" />
        <Row items={ROW_TWO} compact reverse duration="70s" />
      </div>
    </section>
  );
}

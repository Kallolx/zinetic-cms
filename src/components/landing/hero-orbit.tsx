"use client";

import Image from "next/image";
import { AutoVideo } from "@/components/landing/primitives";
import { MEDIA } from "@/lib/landing-services";

type Slide = { kind: "video" | "image"; src: string; label: string };

// 12 slides around the ring, 30 degrees apart. Videos are kept few so the page stays light.
const SLIDES: Slide[] = [
  { kind: "video", src: MEDIA.presenterWoman, label: "AI Avatar Video" },
  { kind: "image", src: MEDIA.purpleStage, label: "Music Distribution" },
  { kind: "image", src: MEDIA.pinkNeonPortrait, label: "AI Music Generator" },
  { kind: "video", src: MEDIA.greenPresenterB, label: "AI Video Translation" },
  { kind: "image", src: MEDIA.amberVinyl, label: "Royalties, 90% yours" },
  { kind: "image", src: MEDIA.micRedCurtain, label: "AI Voice Generator" },
  { kind: "video", src: MEDIA.neonDancer, label: "AI Prompt to Video" },
  { kind: "image", src: MEDIA.crowdPurple, label: "Worldwide Release" },
  { kind: "image", src: MEDIA.headphonesRed, label: "AI Voice Changer" },
  { kind: "image", src: MEDIA.blueGuitarist, label: "AI Dubbing" },
  { kind: "image", src: MEDIA.djRed, label: "AI Sound Effects" },
  { kind: "image", src: MEDIA.studioRoom, label: "Audio Cleaner" },
];

export function HeroOrbit() {
  return (
    <div aria-hidden className="zl-orbit">
      <div className="zl-orbit-ring">
        <div className="zl-orbit-spin">
          {SLIDES.map((s, i) => (
            <div key={s.label} className="zl-orbit-card" style={{ ["--i" as string]: i }}>
              <div className="relative h-full w-full overflow-hidden rounded-[18px] border border-white/15 bg-black shadow-[0_30px_70px_-30px_rgb(0_0_0/0.8)] sm:rounded-[22px]">
                {s.kind === "video" ? (
                  <AutoVideo src={s.src} />
                ) : (
                  <Image src={s.src} alt="" fill sizes="340px" className="object-cover" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <span className="absolute bottom-3 left-3 rounded-full bg-black/50 px-2.5 py-1 text-[0.65rem] font-semibold tracking-wide text-white backdrop-blur-md sm:text-xs">
                  {s.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

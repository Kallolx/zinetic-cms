import type { BentoSize } from "@/components/studio/media";

// Bento layout: [tool id, size, grid spans]. Spans are mobile (2 columns) then md (12 columns).
export const LAYOUT: Record<string, [string, BentoSize, string][]> = {
  audio: [
    ["voice", "lg", "col-span-2 row-span-2 md:col-span-6"],
    ["music", "md", "col-span-1 row-span-2 md:col-span-3"],
    ["voice-changer", "sm", "col-span-1 md:col-span-3"],
    ["sound-effects", "sm", "col-span-1 md:col-span-3"],
    ["transcribe", "sm", "col-span-1 md:col-span-4"],
    ["audio-cleaner", "sm", "col-span-1 md:col-span-4"],
    ["dubbing", "sm", "col-span-2 md:col-span-4"],
  ],
  video: [
    ["avatar-video", "lg", "col-span-2 row-span-2 md:col-span-6"],
    ["prompt-video", "md", "col-span-1 row-span-2 md:col-span-3"],
    ["avatar-creator", "sm", "col-span-1 md:col-span-3"],
    ["video-translation", "sm", "col-span-1 md:col-span-3"],
    ["lip-sync", "sm", "col-span-1 md:col-span-4"],
    ["short-clips", "sm", "col-span-1 md:col-span-4"],
    ["filler-remover", "sm", "col-span-2 md:col-span-4"],
  ],
};

export const GRID = "grid grid-flow-dense auto-rows-[11rem] grid-cols-2 gap-3 md:grid-cols-12 md:auto-rows-[10rem] xl:auto-rows-[10.75rem]";

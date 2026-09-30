import { existsSync } from "fs";
import path from "path";
import { TOOLS, type StudioTool } from "@/lib/studio/tools";

export type Art = StudioTool["media"];

const EXTS: { ext: string; type: Art["type"] }[] = [
  { ext: "mp4", type: "video" },
  { ext: "webm", type: "video" },
  { ext: "webp", type: "image" },
  { ext: "jpg", type: "image" },
  { ext: "jpeg", type: "image" },
  { ext: "png", type: "image" },
];

/**
 * Artwork for a tool. Drop a file named after the tool id into public/studio
 * (voice.webp, music.mp4 ...) and it is picked up here; until then the stock
 * clip from the tool registry is used.
 */
export function toolArt(id: string): Art {
  for (const { ext, type } of EXTS) {
    if (existsSync(path.join(process.cwd(), "public", "studio", `${id}.${ext}`))) {
      return { type, src: `/studio/${id}.${ext}` };
    }
  }
  return TOOLS.find((t) => t.id === id)!.media;
}

export const allArt = (): Record<string, Art> => Object.fromEntries(TOOLS.map((t) => [t.id, toolArt(t.id)]));

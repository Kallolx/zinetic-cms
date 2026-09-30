import type { IconType } from "react-icons";
import {
  LuAudioLines,
  LuAudioWaveform,
  LuClapperboard,
  LuCircleUserRound,
  LuFileText,
  LuLanguages,
  LuMic,
  LuMusic,
  LuScissors,
  LuSparkles,
  LuVolume2,
  LuWandSparkles,
  LuVideo,
  LuEraser,
  LuSmile,
} from "react-icons/lu";

export type ToolGroup = "audio" | "video";

export type StudioTool = {
  id: string;
  name: string;
  blurb: string;
  group: ToolGroup;
  icon: IconType;
  href?: string;
  /** generation kinds this tool writes, used for its recent list */
  kinds?: string[];
  /** not buildable on the current providers yet */
  soon?: string;
};

export const GROUPS: { id: ToolGroup; label: string; blurb: string }[] = [
  { id: "audio", label: "Voice and audio", blurb: "Speech, music, sound and transcripts." },
  { id: "video", label: "Video", blurb: "Avatars, translation and prompt-made video." },
];

export const TOOLS: StudioTool[] = [
  { id: "voice", name: "Voice generator", blurb: "Turn a script into natural speech in any voice.", group: "audio", icon: LuAudioLines, href: "/studio/voice", kinds: ["voice"] },
  { id: "voice-changer", name: "Voice changer", blurb: "Re-voice a recording and keep its timing and emotion.", group: "audio", icon: LuMic, href: "/studio/voice-changer", kinds: ["voice-changer"] },
  { id: "sound-effects", name: "Sound effects", blurb: "Describe a sound: ambience, impacts, seamless loops.", group: "audio", icon: LuVolume2, href: "/studio/sound-effects", kinds: ["sfx"] },
  { id: "music", name: "Music generator", blurb: "Describe a song and get a finished track back.", group: "audio", icon: LuMusic, href: "/studio/music", kinds: ["music"] },
  { id: "transcribe", name: "Speech to text", blurb: "Transcripts with speakers and timestamps.", group: "audio", icon: LuFileText, href: "/studio/transcribe", kinds: ["transcribe"] },
  { id: "audio-cleaner", name: "Audio cleaner", blurb: "Remove noise and isolate the voice.", group: "audio", icon: LuAudioWaveform, href: "/studio/audio-cleaner", kinds: ["audio-cleaner"] },
  { id: "dubbing", name: "Dubbing", blurb: "Dub audio or video into another language.", group: "audio", icon: LuLanguages, href: "/studio/dubbing", kinds: ["dubbing"] },

  { id: "avatar-video", name: "Avatar video", blurb: "A presenter that speaks your script.", group: "video", icon: LuClapperboard, href: "/studio/avatar-video", kinds: ["avatar-video"] },
  { id: "avatar-creator", name: "Avatar creator", blurb: "Turn a photo into an avatar you can reuse.", group: "video", icon: LuCircleUserRound, href: "/studio/avatar-creator" },
  { id: "video-translation", name: "Video translation", blurb: "Translate a video, with optional lip sync.", group: "video", icon: LuVideo, href: "/studio/video-translation", kinds: ["video-translation", "translation-lipsync"] },
  { id: "prompt-video", name: "Prompt to video", blurb: "Describe a video and get it made.", group: "video", icon: LuSparkles, href: "/studio/prompt-video", kinds: ["prompt-video"] },
  { id: "lip-sync", name: "Lip sync", blurb: "Match a video to new audio.", group: "video", icon: LuSmile, soon: "Needs a lip-sync provider" },
  { id: "short-clips", name: "Short clip generator", blurb: "Cut a long video into Shorts, Reels and TikToks.", group: "video", icon: LuScissors, soon: "Coming next" },
  { id: "filler-remover", name: "Filler word remover", blurb: "Remove ums, ahs and long silences.", group: "video", icon: LuEraser, soon: "Coming next" },
];

export const toolByHref = (href: string) => TOOLS.find((t) => t.href === href);
export { LuWandSparkles };

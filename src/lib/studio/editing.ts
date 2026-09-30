import type { Transcript } from "@/lib/studio/elevenlabs";
import type { Range } from "@/lib/studio/ffmpeg";

type Word = Transcript["words"][number];

const FILLERS = new Set(["um", "umm", "uh", "uhh", "uhm", "er", "erm", "ah", "ahh", "eh", "hmm", "hm", "mm", "mmm", "mhm"]);
const norm = (w: string) => w.toLowerCase().replace(/[^a-z]/g, "");

export function fillerRanges(words: Word[]): Range[] {
  return words.filter((w) => FILLERS.has(norm(w.text))).map((w) => ({ start: Math.max(0, w.start - 0.03), end: w.end + 0.03 }));
}

/** Gaps between words longer than `minGap` are cut down to a short natural pause. */
export function pauseRanges(words: Word[], minGap: number): Range[] {
  const keep = 0.2;
  const out: Range[] = [];
  for (let i = 1; i < words.length; i++) {
    const gap = words[i].start - words[i - 1].end;
    if (gap > minGap) out.push({ start: words[i - 1].end + keep, end: words[i].start - keep });
  }
  return out;
}

export function merge(ranges: Range[]): Range[] {
  const sorted = [...ranges].sort((a, b) => a.start - b.start);
  const out: Range[] = [];
  for (const r of sorted) {
    const last = out[out.length - 1];
    if (last && r.start <= last.end) last.end = Math.max(last.end, r.end);
    else out.push({ ...r });
  }
  return out;
}

/** The parts of [0, total] that are NOT inside `remove`. */
export function invert(remove: Range[], total: number): Range[] {
  const keep: Range[] = [];
  let at = 0;
  for (const r of merge(remove)) {
    if (r.start - at > 0.1) keep.push({ start: at, end: r.start });
    at = Math.max(at, r.end);
  }
  if (total - at > 0.1) keep.push({ start: at, end: total });
  return keep;
}

export const span = (rs: Range[]) => rs.reduce((n, r) => n + (r.end - r.start), 0);

export type Clip = Range & { score: number; text: string };

/**
 * Picks the most engaging stretches of speech. This ranks by how dense and
 * continuous the talking is, it does not understand what is being said.
 * Clips start and end on sentence boundaries and never overlap.
 */
export function pickClips(words: Word[], opts: { count: number; target: number }): Clip[] {
  if (words.length === 0) return [];

  // sentences: end on . ? ! or a long pause
  const sentences: { start: number; end: number; words: Word[] }[] = [];
  let cur: Word[] = [];
  words.forEach((w, i) => {
    cur.push(w);
    const next = words[i + 1];
    if (/[.?!]$/.test(w.text) || !next || next.start - w.end > 0.9) {
      sentences.push({ start: cur[0].start, end: w.end, words: cur });
      cur = [];
    }
  });

  const min = opts.target * 0.7;
  const max = opts.target * 1.2;
  const candidates: Clip[] = [];
  for (let i = 0; i < sentences.length; i++) {
    let end = i;
    while (end < sentences.length) {
      const len = sentences[end].end - sentences[i].start;
      if (len > max) break;
      if (len >= min) {
        const ws = sentences.slice(i, end + 1).flatMap((s) => s.words);
        const talked = ws.reduce((n, w) => n + (w.end - w.start), 0);
        const density = ws.length / len; // words per second
        const continuity = talked / len; // share of time someone is speaking
        const questions = ws.filter((w) => w.text.endsWith("?")).length;
        candidates.push({
          start: sentences[i].start,
          end: sentences[end].end,
          score: density * 0.6 + continuity * 2 + Math.min(questions, 2) * 0.3,
          text: ws.map((w) => w.text).join(" "),
        });
      }
      end++;
    }
  }

  const chosen: Clip[] = [];
  for (const c of candidates.sort((a, b) => b.score - a.score)) {
    if (chosen.length >= opts.count) break;
    if (chosen.every((k) => c.end <= k.start || c.start >= k.end)) chosen.push(c);
  }
  return chosen.sort((a, b) => a.start - b.start);
}

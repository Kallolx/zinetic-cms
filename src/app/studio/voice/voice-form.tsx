"use client";

import * as React from "react";
import { LuLoaderCircle } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Voice } from "@/lib/studio/elevenlabs";

const MAX = 2500;

export function VoiceForm({ voices }: { voices: Voice[] }) {
  const [text, setText] = React.useState("");
  const [voiceId, setVoiceId] = React.useState(voices[0]?.id ?? "");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [fileId, setFileId] = React.useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    setFileId(null);
    try {
      const res = await fetch("/api/studio/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voiceId }),
      });
      const json = (await res.json()) as { id?: string; error?: string };
      if (!res.ok || !json.id) setError(json.error ?? "Something went wrong.");
      else setFileId(json.id);
    } catch {
      setError("Could not reach the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-5 pt-6">
        <label className="flex flex-col gap-2 text-sm font-medium">
          Voice
          <select
            value={voiceId}
            onChange={(e) => setVoiceId(e.target.value)}
            className="h-10 rounded-md border bg-background px-3 text-sm"
          >
            {voices.length === 0 && <option value="">No voices available</option>}
            {voices.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
                {v.category ? ` (${v.category})` : ""}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium">
          Script
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, MAX))}
            rows={8}
            placeholder="Type or paste what the voice should say."
            className="rounded-md border bg-background p-3 text-sm font-normal"
          />
          <span className="text-xs font-normal text-muted-foreground">
            {text.length} / {MAX}
          </span>
        </label>

        <div className="flex items-center gap-4">
          <Button onClick={generate} disabled={loading || !text.trim() || !voiceId}>
            {loading && <LuLoaderCircle className="size-4 animate-spin" />}
            {loading ? "Generating" : "Generate audio"}
          </Button>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        {fileId && (
          <div className="flex flex-col gap-2 border-t pt-5">
            <audio controls src={`/api/studio/files/${fileId}`} className="w-full" />
            <a href={`/api/studio/files/${fileId}`} download={`voice-${fileId}.mp3`} className="text-sm underline">
              Download MP3
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

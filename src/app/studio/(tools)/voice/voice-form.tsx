"use client";

import * as React from "react";
import type { Voice } from "@/lib/studio/elevenlabs";
import { useJob } from "@/components/studio/use-job";
import { AudioResult, Field, Output, SubmitButton, TextArea, VoicePicker, Workspace, EnginePicker, useEngine } from "@/components/studio/ui";

export function VoiceForm({ voices }: { voices: Voice[] }) {
  const [text, setText] = React.useState("");
  const [voiceId, setVoiceId] = React.useState(voices[0]?.id ?? "");
  const { state, run } = useJob();
  const eng = useEngine();

  const items = voices.map((v) => ({ id: v.id, name: v.name, meta: v.labels ?? v.category, preview: v.previewUrl }));

  return (
    <Workspace
      form={
        <>
          <EnginePicker />
          <Field label="Script">
            <TextArea value={text} onChange={setText} max={5000} rows={9} placeholder="Type or paste what the voice should say." />
          </Field>
          <Field label="Voice">
            <VoicePicker items={items} value={voiceId} onChange={setVoiceId} />
          </Field>
          <SubmitButton
            busy={state.phase === "working"}
            disabled={!text.trim() || !voiceId}
            busyLabel="Generating"
            onClick={() =>
              run(() =>
                fetch("/api/studio/voice", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ engine: eng.key, text, voiceId }),
                })
              )
            }
          >
            Generate voice
          </SubmitButton>
        </>
      }
      output={
        <Output state={state} idle="Your audio will appear here, ready to play and download." working="Generating your audio.">
          {state.phase === "done" && <AudioResult id={state.id} name="voice.mp3" />}
        </Output>
      }
    />
  );
}

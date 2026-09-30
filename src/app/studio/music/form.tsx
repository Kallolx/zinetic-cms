"use client";

import * as React from "react";
import { useJob } from "@/components/studio/use-job";
import { AudioResult, Field, Output, Segmented, SubmitButton, TextArea, Workspace, EnginePicker, useEngine } from "@/components/studio/ui";

const IDEAS = [
  "Warm lo-fi hip hop with soft piano and vinyl crackle",
  "Upbeat Bengali pop with dhol and a catchy chorus",
  "Dark cinematic trap with heavy 808s",
  "Gentle acoustic guitar ballad about coming home",
];

export function MusicForm() {
  const [prompt, setPrompt] = React.useState("");
  const [seconds, setSeconds] = React.useState("30");
  const { state, run } = useJob();
  const eng = useEngine();

  return (
    <Workspace
      form={
        <>
          <EnginePicker />
          <Field label="Describe the track" hint="Genre, mood, instruments, vocals">
            <TextArea value={prompt} onChange={setPrompt} max={1500} rows={7} placeholder="An energetic synthwave track with a soaring female vocal" />
            <div className="flex flex-col items-start gap-2">
              {IDEAS.map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setPrompt(i)}
                  className="cursor-pointer text-left text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  {i}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Length">
            <Segmented
              value={seconds}
              onChange={setSeconds}
              options={[
                { value: "15", label: "15s" },
                { value: "30", label: "30s" },
                { value: "60", label: "1 min" },
                { value: "120", label: "2 min" },
              ]}
            />
          </Field>
          <SubmitButton
            busy={state.phase === "working"}
            disabled={!prompt.trim()}
            busyLabel="Composing"
            onClick={() =>
              run(() =>
                fetch("/api/studio/music", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ engine: eng.key, prompt, seconds: Number(seconds) }),
                })
              )
            }
          >
            Generate music
          </SubmitButton>
        </>
      }
      output={
        <Output state={state} idle="Your track will appear here." working="Composing your track. Longer tracks take a minute or two.">
          {state.phase === "done" && <AudioResult id={state.id} name="track.mp3" />}
        </Output>
      }
    />
  );
}

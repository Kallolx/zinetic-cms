"use client";

import * as React from "react";
import { useJob } from "@/components/studio/use-job";
import { Field, Output, SubmitButton, TextArea, VideoResult, Workspace, EnginePicker, useEngine } from "@/components/studio/ui";

const IDEAS = [
  "A 30 second promo for a new lo-fi album release, calm and cinematic",
  "Explain how music royalties work in simple words for new artists",
  "A friendly welcome video for new subscribers of a music channel",
];

export function PromptVideoForm() {
  const [prompt, setPrompt] = React.useState("");
  const { state, run } = useJob();
  const eng = useEngine();

  return (
    <Workspace
      form={
        <>
          <EnginePicker />
          <Field label="Describe your video" hint="Topic, tone, length">
            <TextArea value={prompt} onChange={setPrompt} max={2000} rows={8} placeholder="A 45 second video explaining..." />
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
          <SubmitButton
            busy={state.phase === "working"}
            disabled={!prompt.trim()}
            busyLabel="Creating video"
            onClick={() =>
              run(
                () =>
                  fetch("/api/studio/video/agent", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ engine: eng.key, prompt }),
                  }),
                { async: true, message: "Your video is being made" }
              )
            }
          >
            Create video
          </SubmitButton>
        </>
      }
      output={
        <Output state={state} idle="Your video will appear here." working="Prompt videos take several minutes. You can leave this page, it will be in your Library.">
          {state.phase === "done" && <VideoResult id={state.id} name="video.mp4" />}
        </Output>
      }
    />
  );
}

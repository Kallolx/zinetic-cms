"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { useJob } from "@/components/studio/use-job";
import { AudioResult, Field, Output, Segmented, SubmitButton, TextArea, Workspace, EnginePicker, useEngine } from "@/components/studio/ui";

const IDEAS = ["Heavy rain on a tin roof", "Cinematic bass drop with a long tail", "Crowd cheering in a stadium", "Footsteps on gravel"];

export function SfxForm() {
  const [text, setText] = React.useState("");
  const [seconds, setSeconds] = React.useState("auto");
  const [loop, setLoop] = React.useState("no");
  const { state, run } = useJob();
  const eng = useEngine();

  return (
    <Workspace
      form={
        <>
          <EnginePicker />
          <Field label="Describe the sound">
            <TextArea value={text} onChange={setText} max={450} rows={5} placeholder="A wooden door creaking open in an empty hall" />
            <div className="flex flex-wrap gap-2">
              {IDEAS.map((i) => (
                <Button key={i} variant="outline" size="xs" onClick={() => setText(i)}>{i}</Button>
              ))}
            </div>
          </Field>
          <Field label="Length">
            <Segmented
              value={seconds}
              onChange={setSeconds}
              options={[
                { value: "auto", label: "Auto" },
                { value: "3", label: "3s" },
                { value: "8", label: "8s" },
                { value: "15", label: "15s" },
                { value: "30", label: "30s" },
              ]}
            />
          </Field>
          {eng.has("loop") && (
          <Field label="Seamless loop">
            <Segmented value={loop} onChange={setLoop} options={[{ value: "no", label: "Off" }, { value: "yes", label: "On" }]} />
          </Field>
          )}
          <SubmitButton
            busy={state.phase === "working"}
            disabled={!text.trim()}
            busyLabel="Generating"
            onClick={() =>
              run(() =>
                fetch("/api/studio/sfx", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ engine: eng.key, text, seconds: seconds === "auto" ? undefined : Number(seconds), loop: loop === "yes" }),
                })
              )
            }
          >
            Generate sound
          </SubmitButton>
        </>
      }
      output={
        <Output state={state} idle="Your sound effect will appear here." working="Generating the sound.">
          {state.phase === "done" && <AudioResult id={state.id} name="sound-effect.mp3" />}
        </Output>
      }
    />
  );
}

"use client";

import * as React from "react";
import { DUB_LANGUAGES } from "@/lib/studio/dub-languages";
import { useJob } from "@/components/studio/use-job";
import { Field, FileDrop, inputClass, Output, SubmitButton, Workspace, AudioResult, VideoResult } from "@/components/studio/ui";

export function DubbingForm() {
  const [file, setFile] = React.useState<File | null>(null);
  const [lang, setLang] = React.useState("en");
  const { state, run } = useJob();
  const isVideo = Boolean(file?.type.startsWith("video"));

  function submit() {
    const fd = new FormData();
    fd.append("file", file!);
    fd.append("targetLang", lang);
    return run(() => fetch("/api/studio/dubbing", { method: "POST", body: fd }), { async: true, message: "Dubbing in progress" });
  }

  return (
    <Workspace
      form={
        <>
          <Field label="Audio or video" hint="Up to 200 MB">
            <FileDrop accept="audio/*,video/*" file={file} onFile={setFile} hint="Speakers keep their own voice and timing." />
          </Field>
          <Field label="Dub into">
            <select value={lang} onChange={(e) => setLang(e.target.value)} className={inputClass}>
              {DUB_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.name}
                </option>
              ))}
            </select>
          </Field>
          <SubmitButton busy={state.phase === "working"} disabled={!file} busyLabel="Dubbing" onClick={submit}>
            Start dubbing
          </SubmitButton>
        </>
      }
      output={
        <Output state={state} idle="The dubbed file will appear here." working="Dubbing takes a few minutes depending on length. You can leave this page.">
          {state.phase === "done" &&
            (isVideo ? <VideoResult id={state.id} name="dubbed.mp4" /> : <AudioResult id={state.id} name="dubbed.mp3" />)}
        </Output>
      }
    />
  );
}

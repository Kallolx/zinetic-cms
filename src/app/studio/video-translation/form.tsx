"use client";

import * as React from "react";
import { useJob } from "@/components/studio/use-job";
import { Field, FileDrop, inputClass, Output, Segmented, SubmitButton, VideoResult, Workspace } from "@/components/studio/ui";

export function TranslateForm({ languages }: { languages: string[] }) {
  const [file, setFile] = React.useState<File | null>(null);
  const [language, setLanguage] = React.useState(languages.find((l) => l === "English") ?? languages[0] ?? "");
  const [lipsync, setLipsync] = React.useState("yes");
  const { state, run } = useJob();

  function submit() {
    const fd = new FormData();
    fd.append("video", file!);
    fd.append("language", language);
    fd.append("lipsync", lipsync === "yes" ? "true" : "false");
    return run(() => fetch("/api/studio/video/translate", { method: "POST", body: fd }), { async: true, message: "Translating your video" });
  }

  return (
    <Workspace
      form={
        <>
          <Field label="Video" hint="MP4, up to 200 MB">
            <FileDrop accept="video/*" file={file} onFile={setFile} hint="The speaker is translated and keeps their own voice." />
          </Field>
          <Field label="Translate into">
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className={inputClass}>
              {languages.length === 0 && <option value="">Languages unavailable</option>}
              {languages.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Lip sync" hint="Match the mouth to the new language">
            <Segmented value={lipsync} onChange={setLipsync} options={[{ value: "yes", label: "On" }, { value: "no", label: "Off" }]} />
          </Field>
          <SubmitButton busy={state.phase === "working"} disabled={!file || !language} busyLabel="Translating" onClick={submit}>
            Translate video
          </SubmitButton>
        </>
      }
      output={
        <Output state={state} idle="The translated video will appear here." working="Translation takes a few minutes. You can leave this page, it will be in your Library.">
          {state.phase === "done" && <VideoResult id={state.id} name="translated.mp4" />}
        </Output>
      }
    />
  );
}

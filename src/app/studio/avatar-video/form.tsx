"use client";

import * as React from "react";
import { AvatarPicker, type AvatarItem } from "@/components/studio/avatar-picker";
import { useJob } from "@/components/studio/use-job";
import { Field, Output, Segmented, SubmitButton, TextArea, VideoResult, VoicePicker, Workspace, type PickerItem } from "@/components/studio/ui";

export function AvatarVideoForm({ avatars, voices }: { avatars: AvatarItem[]; voices: PickerItem[] }) {
  const [avatarId, setAvatarId] = React.useState(avatars[0]?.id ?? "");
  const [mine, setMine] = React.useState(Boolean(avatars[0]?.mine));
  const [voiceId, setVoiceId] = React.useState(voices.find((v) => v.meta?.startsWith("English"))?.id ?? voices[0]?.id ?? "");
  const [script, setScript] = React.useState("");
  const [ratio, setRatio] = React.useState("16:9");
  const { state, run } = useJob();

  function submit() {
    return run(
      () =>
        fetch("/api/studio/video/avatar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ [mine ? "myAvatarId" : "avatarId"]: avatarId, voiceId, script, ratio }),
        }),
      { async: true, message: "Your video is being made" }
    );
  }

  return (
    <Workspace
      form={
        <>
          <Field label="Avatar">
            <AvatarPicker items={avatars} value={avatarId} onChange={(id, m) => { setAvatarId(id); setMine(m); }} />
          </Field>
          <Field label="Voice">
            <VoicePicker items={voices} value={voiceId} onChange={setVoiceId} />
          </Field>
          <Field label="Script">
            <TextArea value={script} onChange={setScript} max={4000} rows={6} placeholder="What should the presenter say?" />
          </Field>
          {!mine && (
            <Field label="Shape">
              <Segmented
                value={ratio}
                onChange={setRatio}
                options={[{ value: "16:9", label: "Wide" }, { value: "9:16", label: "Vertical" }, { value: "1:1", label: "Square" }]}
              />
            </Field>
          )}
          <SubmitButton busy={state.phase === "working"} disabled={!avatarId || !voiceId || !script.trim()} busyLabel="Creating video" onClick={submit}>
            Create video
          </SubmitButton>
        </>
      }
      output={
        <Output state={state} idle="Your video will appear here." working="Videos usually take a few minutes. You can leave this page, it will be in your Library.">
          {state.phase === "done" && <VideoResult id={state.id} name="avatar-video.mp4" />}
        </Output>
      }
    />
  );
}

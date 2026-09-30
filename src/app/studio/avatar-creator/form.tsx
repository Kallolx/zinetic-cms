"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LuCheck } from "react-icons/lu";
import { Field, FileDrop, inputClass, SubmitButton, useObjectUrl, Workspace, EnginePicker, useEngine } from "@/components/studio/ui";

export function CreatorForm() {
  const router = useRouter();
  const eng = useEngine();
  const [name, setName] = React.useState("");
  const [photo, setPhoto] = React.useState<File | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [done, setDone] = React.useState(false);
  const preview = useObjectUrl(photo);

  async function submit() {
    setBusy(true);
    setError(null);
    setDone(false);
    const fd = new FormData();
    fd.append("engine", eng.key);
    fd.append("name", name);
    fd.append("photo", photo!);
    try {
      const res = await fetch("/api/studio/avatars", { method: "POST", body: fd });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) setError(json.error ?? "Something went wrong.");
      else {
        setDone(true);
        setName("");
        setPhoto(null);
        router.refresh();
      }
    } catch {
      setError("Could not reach the server.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Workspace
      form={
        <>
          <EnginePicker />
          <Field label="Name">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Anika, presenter" className={inputClass} />
          </Field>
          <Field label="Photo" hint="JPG or PNG">
            <FileDrop accept="image/*" file={photo} onFile={setPhoto} hint="A clear, front-facing photo with good light works best." />
          </Field>
          <SubmitButton busy={busy} disabled={!name.trim() || !photo} busyLabel="Creating avatar" onClick={submit}>
            Create avatar
          </SubmitButton>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </>
      }
      output={
        <div className="flex min-h-64 flex-col items-center justify-center gap-4 text-center">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="max-h-80 rounded-lg object-cover" />
          ) : done ? (
            <p className="flex items-center gap-2 text-sm font-medium">
              <LuCheck className="size-4 text-emerald-500" /> Avatar saved. Use it in Avatar video.
            </p>
          ) : (
            <p className="max-w-xs text-sm text-muted-foreground">Your photo preview appears here. Saved avatars show up in Avatar video under Yours.</p>
          )}
        </div>
      }
    />
  );
}

import { listVoices, hasElevenLabs } from "@/lib/studio/elevenlabs";
import { VoiceForm } from "./voice-form";

export default async function VoicePage() {
  const voices = await listVoices();
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-heading text-2xl font-semibold">Text to speech</h2>
        <p className="text-[0.925rem] text-muted-foreground">Write a script, pick a voice and generate audio.</p>
      </div>
      {!hasElevenLabs() && (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
          ElevenLabs is not connected yet. Add <code>ELEVENLABS_API_KEY</code> to the environment and restart.
        </p>
      )}
      <VoiceForm voices={voices} />
    </div>
  );
}

import { listVoices, hasElevenLabs } from "@/lib/studio/elevenlabs";
import { ToolPage } from "@/components/studio/tool-page";
import { VoiceForm } from "./voice-form";

export default async function VoicePage() {
  const voices = await listVoices();
  return (
    <ToolPage toolId="voice" notice={!hasElevenLabs() ? "ElevenLabs is not connected yet. Add ELEVENLABS_API_KEY to the environment and restart." : null}>
      <VoiceForm voices={voices} />
    </ToolPage>
  );
}

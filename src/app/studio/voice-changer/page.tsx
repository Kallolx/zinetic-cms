import { listVoices, hasElevenLabs } from "@/lib/studio/elevenlabs";
import { ToolPage } from "@/components/studio/tool-page";
import { VoiceChangerForm } from "./form";

export default async function Page() {
  const voices = await listVoices();
  return (
    <ToolPage toolId="voice-changer" notice={!hasElevenLabs() ? "ElevenLabs is not connected yet. Add ELEVENLABS_API_KEY to the environment and restart." : null}>
      <VoiceChangerForm voices={voices} />
    </ToolPage>
  );
}

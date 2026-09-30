import { hasElevenLabs } from "@/lib/studio/elevenlabs";
import { ToolPage } from "@/components/studio/tool-page";
import { DubbingForm } from "./form";

export default function Page() {
  return (
    <ToolPage toolId="dubbing" notice={!hasElevenLabs() ? "ElevenLabs is not connected yet. Add ELEVENLABS_API_KEY to the environment and restart." : null}>
      <DubbingForm />
    </ToolPage>
  );
}

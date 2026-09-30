import { Suspense } from "react";
import { listVoices, hasElevenLabs } from "@/lib/studio/elevenlabs";
import { ToolPage } from "@/components/studio/tool-page";
import { WorkspaceSkeleton } from "@/components/studio/workspace-skeleton";
import { VoiceChangerForm } from "./form";

async function Loaded() {
  return <VoiceChangerForm voices={await listVoices()} />;
}

export default function Page() {
  return (
    <ToolPage toolId="voice-changer" notice={!hasElevenLabs() ? "ElevenLabs is not connected yet. Add ELEVENLABS_API_KEY to the environment and restart." : null}>
      <Suspense fallback={<WorkspaceSkeleton />}>
        <Loaded />
      </Suspense>
    </ToolPage>
  );
}

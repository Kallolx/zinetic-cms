import { Suspense } from "react";
import { listVoices, hasElevenLabs } from "@/lib/studio/elevenlabs";
import { ToolPage } from "@/components/studio/tool-page";
import { WorkspaceSkeleton } from "@/components/studio/workspace-skeleton";
import { VoiceForm } from "./voice-form";

async function Loaded() {
  return <VoiceForm voices={await listVoices()} />;
}

export default function VoicePage() {
  return (
    <ToolPage toolId="voice" notice={!hasElevenLabs() ? "ElevenLabs is not connected yet. Add ELEVENLABS_API_KEY to the environment and restart." : null}>
      <Suspense fallback={<WorkspaceSkeleton />}>
        <Loaded />
      </Suspense>
    </ToolPage>
  );
}

import { Suspense } from "react";
import { ToolPage } from "@/components/studio/tool-page";
import { TranslateForm } from "@/components/studio/translate-form";
import { WorkspaceSkeleton } from "@/components/studio/workspace-skeleton";
import { languagesFor } from "@/lib/studio/languages";

async function Loaded() {
  return (
    <TranslateForm
      endpoint="/api/studio/video/translate"
      field="video"
      accept="video/*"
      hint="The speaker is translated and keeps their own voice."
      busyMessage="Translating your video"
      languagesByEngine={await languagesFor("video-translation")}
      resultName="translated"
    />
  );
}

export default function Page() {
  return (
    <ToolPage toolId="video-translation">
      <Suspense fallback={<WorkspaceSkeleton />}>
        <Loaded />
      </Suspense>
    </ToolPage>
  );
}

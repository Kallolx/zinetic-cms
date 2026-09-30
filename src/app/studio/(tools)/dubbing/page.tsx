import { Suspense } from "react";
import { ToolPage } from "@/components/studio/tool-page";
import { TranslateForm } from "@/components/studio/translate-form";
import { WorkspaceSkeleton } from "@/components/studio/workspace-skeleton";
import { languagesFor } from "@/lib/studio/languages";

async function Loaded() {
  return (
    <TranslateForm
      endpoint="/api/studio/dubbing"
      field="file"
      accept="audio/*,video/*"
      hint="Speakers keep their own voice and timing."
      busyMessage="Dubbing in progress"
      languagesByEngine={await languagesFor("dubbing")}
      resultName="dubbed"
    />
  );
}

export default function Page() {
  return (
    <ToolPage toolId="dubbing">
      <Suspense fallback={<WorkspaceSkeleton />}>
        <Loaded />
      </Suspense>
    </ToolPage>
  );
}

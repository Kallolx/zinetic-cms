import { ToolPage } from "@/components/studio/tool-page";
import { TranslateForm } from "@/components/studio/translate-form";
import { languagesFor } from "@/lib/studio/languages";

export default async function Page() {
  return (
    <ToolPage toolId="video-translation">
      <TranslateForm
        endpoint="/api/studio/video/translate"
        field="video"
        accept="video/*"
        hint="The speaker is translated and keeps their own voice."
        busyMessage="Translating your video"
        languagesByEngine={await languagesFor("video-translation")}
        resultName="translated"
      />
    </ToolPage>
  );
}

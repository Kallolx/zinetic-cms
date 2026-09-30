import { ToolPage } from "@/components/studio/tool-page";
import { TranslateForm } from "@/components/studio/translate-form";
import { languagesFor } from "@/lib/studio/languages";

export default async function Page() {
  return (
    <ToolPage toolId="dubbing">
      <TranslateForm
        endpoint="/api/studio/dubbing"
        field="file"
        accept="audio/*,video/*"
        hint="Speakers keep their own voice and timing."
        busyMessage="Dubbing in progress"
        languagesByEngine={await languagesFor("dubbing")}
        resultName="dubbed"
      />
    </ToolPage>
  );
}

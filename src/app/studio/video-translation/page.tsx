import { hasHeyGen, listTranslateLanguages } from "@/lib/studio/heygen";
import { ToolPage } from "@/components/studio/tool-page";
import { TranslateForm } from "./form";

export default async function Page() {
  const languages = await listTranslateLanguages();
  return (
    <ToolPage toolId="video-translation" notice={!hasHeyGen() ? "HeyGen is not connected yet. Add HEYGEN_API_KEY to the environment and restart." : null}>
      <TranslateForm languages={languages} />
    </ToolPage>
  );
}

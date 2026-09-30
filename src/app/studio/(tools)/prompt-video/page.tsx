import { hasHeyGen } from "@/lib/studio/heygen";
import { ToolPage } from "@/components/studio/tool-page";
import { PromptVideoForm } from "./form";

export default function Page() {
  return (
    <ToolPage toolId="prompt-video" notice={!hasHeyGen() ? "HeyGen is not connected yet. Add HEYGEN_API_KEY to the environment and restart." : null}>
      <PromptVideoForm />
    </ToolPage>
  );
}

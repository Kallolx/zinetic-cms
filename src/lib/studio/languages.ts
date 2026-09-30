import { listEngines } from "@/lib/studio/engines";
import { listTranslateLanguages } from "@/lib/studio/heygen";
import { DUB_LANGUAGES } from "@/lib/studio/dub-languages";
import type { LanguageOption } from "@/components/studio/translate-form";

/** Language choices for each enabled engine of a service, by the engine's provider. */
export async function languagesFor(service: string): Promise<Record<string, LanguageOption[]>> {
  const engines = (await listEngines(service)).filter((e) => e.enabled);
  const heygen = engines.some((e) => e.provider === "heygen") ? await listTranslateLanguages() : [];
  const out: Record<string, LanguageOption[]> = {};
  for (const e of engines) {
    out[e.key] =
      e.provider === "heygen"
        ? heygen.map((l) => ({ value: l, label: l }))
        : DUB_LANGUAGES.map((l) => ({ value: l.code, label: l.name }));
  }
  return out;
}

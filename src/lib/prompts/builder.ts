import type { BrandPromptContext } from "@/lib/brand-profiles/format";
import type { ContentTemplateId, GenerationInput } from "@/types/generation";
import { buildBaseLayer, buildInputLayer, buildSchemaLayer } from "@/lib/prompts/base";
import { buildBrandVoiceLayer } from "@/lib/prompts/brandVoice";
import { buildNicheLayer } from "@/lib/prompts/niches";
import { buildPlatformLayer } from "@/lib/prompts/platforms";
import { buildTemplateLayer } from "@/lib/prompts/templates";
import { buildWeeklyWorkflowLayer } from "@/lib/prompts/weeklyWorkflow";

type PromptOptions = {
  brandContext?: BrandPromptContext | null;
  contentTemplateId?: ContentTemplateId | string | null;
};

function assemblePrompt(input: GenerationInput, options: PromptOptions): string {
  return [
    buildBaseLayer(),
    buildInputLayer(input),
    buildNicheLayer(input.niche),
    buildBrandVoiceLayer(options.brandContext),
    buildTemplateLayer(options.contentTemplateId),
    buildWeeklyWorkflowLayer(input),
    buildPlatformLayer(),
    buildSchemaLayer(),
  ].join("\n\n");
}

export function buildPrompt(
  input: GenerationInput,
  options: PromptOptions = {}
): string {
  return assemblePrompt(input, options);
}

export function buildRetryPrompt(
  input: GenerationInput,
  reason: string,
  options: PromptOptions = {}
): string {
  return [
    assemblePrompt(input, options),
    "The previous response failed validation.",
    `Fix the JSON and return only valid JSON. Error: ${reason}`,
  ].join("\n\n");
}

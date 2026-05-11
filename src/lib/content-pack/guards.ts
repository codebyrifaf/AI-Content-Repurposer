import type {
  ContentPackOutput,
  GenerationOutput,
  LegacyGenerationOutput,
} from "@/types/generation";

export function isContentPackOutput(
  output: GenerationOutput | null | undefined
): output is ContentPackOutput {
  if (!output || typeof output !== "object") {
    return false;
  }
  const maybe = output as ContentPackOutput;
  return maybe.version === "content-pack-v1";
}

export function isLegacyGenerationOutput(
  output: GenerationOutput | null | undefined
): output is LegacyGenerationOutput {
  if (!output || typeof output !== "object") {
    return false;
  }
  return "instagramCaption" in output;
}

import type { BrandPromptContext } from "@/lib/brand-profiles/format";

function withFallback(value: string | null, fallback: string) {
  return value && value.trim().length > 0 ? value.trim() : fallback;
}

export function buildBrandVoiceLayer(context?: BrandPromptContext | null): string {
  if (!context) {
    return [
      "Brand voice profile: none provided.",
      "Use user input, niche language, and tone intent without inventing brand facts.",
      "Keep language consistent and avoid exaggerated claims.",
    ].join("\n");
  }

  const lines: string[] = [];
  lines.push("Brand voice directives:");
  lines.push(
    `Tone anchor: ${withFallback(
      context.toneOfVoice,
      "use the requested tone from user input"
    )}.`
  );
  lines.push(
    `Audience focus: ${withFallback(
      context.targetAudience,
      "use the user-provided audience"
    )}.`
  );
  lines.push(
    `CTA style: ${withFallback(
      context.ctaStyle,
      "make CTAs clear and relevant to audience intent"
    )}.`
  );
  lines.push(
    `Writing style: ${withFallback(
      context.writingStyle,
      "concise, specific, and human-sounding"
    )}.`
  );
  lines.push(
    `Business goal emphasis: ${withFallback(
      context.postingGoals,
      "balance trust-building and conversion across the week"
    )}.`
  );

  if (context.platformFocus.length) {
    lines.push(`Platform focus: ${context.platformFocus.join(", ")}.`);
  }

  if (context.brandKeywords.length) {
    lines.push(
      `Use these brand keywords naturally: ${context.brandKeywords.join(", ")}.`
    );
  }

  if (context.forbiddenPhrases.length) {
    lines.push(
      `Never use these forbidden phrases: ${context.forbiddenPhrases.join(", ")}.`
    );
    lines.push("Respect forbidden phrase constraints exactly, even in hooks and CTAs.");
  }

  if (context.summary) {
    lines.push("Brand memory summary:");
    lines.push(context.summary);
  }

  lines.push("Match CTA style naturally and maintain one consistent voice across all sections.");
  return lines.join("\n");
}

import type { ContentPackOutput } from "@/types/generation";

const PLACEHOLDER_PATTERNS = [
  /lorem ipsum/i,
  /\[insert[^\]]*\]/i,
  /\[add[^\]]*\]/i,
  /\[your [^\]]*\]/i,
  /\b(?:tbd|todo)\b/i,
  /coming soon/i,
];

function normalize(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function hasAtLeastWords(text: string, minWords: number): boolean {
  return normalize(text).split(" ").filter(Boolean).length >= minWords;
}

function flattenStrings(value: unknown): string[] {
  if (typeof value === "string") {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => flattenStrings(item));
  }

  if (value && typeof value === "object") {
    return Object.values(value).flatMap((item) => flattenStrings(item));
  }

  return [];
}

function findPlaceholderText(lines: string[]): string | null {
  for (const line of lines) {
    for (const pattern of PLACEHOLDER_PATTERNS) {
      if (pattern.test(line)) {
        return line;
      }
    }
  }
  return null;
}

function findForbiddenPhraseLeak(
  lines: string[],
  forbiddenPhrases: string[]
): string | null {
  if (!forbiddenPhrases.length) {
    return null;
  }

  const normalizedLines = lines.map((line) => line.toLowerCase());
  for (const phrase of forbiddenPhrases) {
    const normalizedPhrase = phrase.trim().toLowerCase();
    if (!normalizedPhrase) {
      continue;
    }
    if (normalizedLines.some((line) => line.includes(normalizedPhrase))) {
      return phrase;
    }
  }

  return null;
}

export type QualityValidationOptions = {
  requireWeeklyWorkflow?: boolean;
  forbiddenPhrases?: string[];
};

export function validateContentPackQuality(
  output: ContentPackOutput,
  options: QualityValidationOptions = {}
): string | null {
  if (!hasAtLeastWords(output.strategy.postingAngle, 4)) {
    return "strategy.postingAngle is too short.";
  }

  if (!hasAtLeastWords(output.strategy.painPoint, 4)) {
    return "strategy.painPoint is too short.";
  }

  if (!hasAtLeastWords(output.strategy.engagementStrategy, 4)) {
    return "strategy.engagementStrategy is too short.";
  }

  if (!hasAtLeastWords(output.reelScript.hook, 3)) {
    return "reelScript.hook is too short.";
  }

  if (!hasAtLeastWords(output.reelScript.cta, 2)) {
    return "reelScript.cta is too short.";
  }

  if (
    output.captionVariations.every(
      (item) => !hasAtLeastWords(item.caption, 6)
    )
  ) {
    return "captionVariations are too thin.";
  }

  if (
    output.hookVariations.every((item) => !hasAtLeastWords(item.hook, 3))
  ) {
    return "hookVariations are too thin.";
  }

  if (options.requireWeeklyWorkflow && !output.weeklyWorkflow) {
    return "weeklyWorkflow summary is missing.";
  }

  if (output.weeklyWorkflow) {
    if (!hasAtLeastWords(output.weeklyWorkflow.strategySummary, 7)) {
      return "weeklyWorkflow.strategySummary is too short.";
    }
    if (!hasAtLeastWords(output.weeklyWorkflow.contentTheme, 3)) {
      return "weeklyWorkflow.contentTheme is too short.";
    }
    if (output.weeklyWorkflow.postingSequence.length < 5) {
      return "weeklyWorkflow.postingSequence is incomplete.";
    }
  }

  const lines = flattenStrings(output).map((line) => normalize(line));
  const placeholder = findPlaceholderText(lines);
  if (placeholder) {
    return `Placeholder text detected: "${placeholder.slice(0, 60)}".`;
  }

  const leakedPhrase = findForbiddenPhraseLeak(
    lines,
    (options.forbiddenPhrases ?? []).map((phrase) => phrase.trim())
  );
  if (leakedPhrase) {
    return `Forbidden phrase leaked: "${leakedPhrase}".`;
  }

  return null;
}

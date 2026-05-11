import type { BrandProfileInput, BrandProfileUpdate } from "@/types/brand-profile";

const LIST_LIMIT = 20;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function normalizeList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean)
    .slice(0, LIST_LIMIT);
}

export function normalizeBrandProfileInput(payload: unknown): BrandProfileInput {
  if (!isRecord(payload)) {
    throw new Error("Invalid profile payload.");
  }

  const name = normalizeString(payload.name);
  if (!name) {
    throw new Error("Brand name is required.");
  }

  return {
    name,
    businessDescription: normalizeString(payload.businessDescription),
    targetAudience: normalizeString(payload.targetAudience),
    offer: normalizeString(payload.offer),
    toneOfVoice: normalizeString(payload.toneOfVoice),
    ctaStyle: normalizeString(payload.ctaStyle),
    platformFocus: normalizeList(payload.platformFocus),
    brandKeywords: normalizeList(payload.brandKeywords),
    forbiddenPhrases: normalizeList(payload.forbiddenPhrases),
    writingStyle: normalizeString(payload.writingStyle),
    postingGoals: normalizeString(payload.postingGoals),
  };
}

export function normalizeBrandProfileUpdate(payload: unknown): BrandProfileUpdate {
  if (!isRecord(payload)) {
    throw new Error("Invalid profile payload.");
  }

  const hasField = (field: string) =>
    Object.prototype.hasOwnProperty.call(payload, field);

  return {
    name: normalizeString(payload.name) ?? undefined,
    businessDescription: normalizeString(payload.businessDescription) ?? undefined,
    targetAudience: normalizeString(payload.targetAudience) ?? undefined,
    offer: normalizeString(payload.offer) ?? undefined,
    toneOfVoice: normalizeString(payload.toneOfVoice) ?? undefined,
    ctaStyle: normalizeString(payload.ctaStyle) ?? undefined,
    platformFocus: hasField("platformFocus")
      ? normalizeList(payload.platformFocus)
      : undefined,
    brandKeywords: hasField("brandKeywords")
      ? normalizeList(payload.brandKeywords)
      : undefined,
    forbiddenPhrases: hasField("forbiddenPhrases")
      ? normalizeList(payload.forbiddenPhrases)
      : undefined,
    writingStyle: normalizeString(payload.writingStyle) ?? undefined,
    postingGoals: normalizeString(payload.postingGoals) ?? undefined,
  };
}

import type { BrandProfile } from "@/types/brand-profile";

const LIST_LIMIT = 8;
const FIELD_LIMIT = 260;

function clamp(value: string) {
  if (value.length <= FIELD_LIMIT) {
    return value;
  }
  return `${value.slice(0, FIELD_LIMIT).trim()}...`;
}

function cleanList(values: string[] | null | undefined) {
  return (values ?? [])
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, LIST_LIMIT);
}

function addLine(lines: string[], label: string, value?: string | null) {
  if (!value) {
    return;
  }
  lines.push(`${label}: ${clamp(value)}`);
}

export type BrandPromptContext = {
  summary: string | null;
  brandName: string | null;
  toneOfVoice: string | null;
  targetAudience: string | null;
  ctaStyle: string | null;
  postingGoals: string | null;
  writingStyle: string | null;
  brandKeywords: string[];
  forbiddenPhrases: string[];
  platformFocus: string[];
};

export function buildBrandSummary(profile?: BrandProfile | null): string | null {
  if (!profile) {
    return null;
  }

  const lines: string[] = [];
  addLine(lines, "Brand", profile.name);
  addLine(lines, "Business", profile.businessDescription);
  addLine(lines, "Offer", profile.offer);
  addLine(lines, "Audience", profile.targetAudience);
  addLine(lines, "Tone", profile.toneOfVoice);
  addLine(lines, "CTA style", profile.ctaStyle);
  addLine(lines, "Writing style", profile.writingStyle);
  addLine(lines, "Goals", profile.postingGoals);

  const platforms = cleanList(profile.platformFocus);
  if (platforms.length) {
    lines.push(`Platform focus: ${platforms.join(", ")}`);
  }

  const keywords = cleanList(profile.brandKeywords);
  if (keywords.length) {
    lines.push(`Brand keywords: ${keywords.join(", ")}`);
  }

  const forbidden = cleanList(profile.forbiddenPhrases);
  if (forbidden.length) {
    lines.push(`Forbidden phrases: ${forbidden.join(", ")}`);
  }

  if (lines.length === 0) {
    return null;
  }

  return lines.join("\n");
}

export function buildBrandPromptContext(
  profile: BrandProfile | null | undefined,
  fallback: { tone?: string | null; audience?: string | null }
): BrandPromptContext {
  const brandTone = profile?.toneOfVoice?.trim() || fallback.tone?.trim() || null;
  const targetAudience =
    profile?.targetAudience?.trim() || fallback.audience?.trim() || null;

  return {
    summary: buildBrandSummary(profile),
    brandName: profile?.name?.trim() || null,
    toneOfVoice: brandTone,
    targetAudience,
    ctaStyle: profile?.ctaStyle?.trim() || null,
    postingGoals: profile?.postingGoals?.trim() || null,
    writingStyle: profile?.writingStyle?.trim() || null,
    brandKeywords: cleanList(profile?.brandKeywords),
    forbiddenPhrases: cleanList(profile?.forbiddenPhrases),
    platformFocus: cleanList(profile?.platformFocus),
  };
}

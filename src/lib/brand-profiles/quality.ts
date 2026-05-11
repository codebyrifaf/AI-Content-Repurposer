import type { BrandProfile } from "@/types/brand-profile";

export type BrandProfileQuality = {
  score: number;
  missing: string[];
  level: "Strong profile" | "Needs more detail" | "Basic profile";
};

function hasText(value: string | null | undefined): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

export function getBrandProfileQuality(profile: BrandProfile): BrandProfileQuality {
  const missing: string[] = [];

  if (!hasText(profile.targetAudience)) {
    missing.push("target audience");
  }
  if (!hasText(profile.offer)) {
    missing.push("offer/service");
  }
  if (!hasText(profile.ctaStyle)) {
    missing.push("CTA style");
  }
  if ((profile.forbiddenPhrases ?? []).filter((item) => item.trim().length > 0).length === 0) {
    missing.push("forbidden phrases");
  }
  if (!hasText(profile.postingGoals)) {
    missing.push("posting goals");
  }

  const score = 5 - missing.length;

  if (score >= 4) {
    return { score, missing, level: "Strong profile" };
  }

  if (score >= 2) {
    return { score, missing, level: "Needs more detail" };
  }

  return { score, missing, level: "Basic profile" };
}

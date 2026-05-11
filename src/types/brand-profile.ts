export type BrandProfile = {
  id: string;
  userId: string;
  name: string;
  businessDescription: string | null;
  targetAudience: string | null;
  offer: string | null;
  toneOfVoice: string | null;
  ctaStyle: string | null;
  platformFocus: string[];
  brandKeywords: string[];
  forbiddenPhrases: string[];
  writingStyle: string | null;
  postingGoals: string | null;
  profileVersion: number;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type BrandProfileInput = {
  name: string;
  businessDescription?: string | null;
  targetAudience?: string | null;
  offer?: string | null;
  toneOfVoice?: string | null;
  ctaStyle?: string | null;
  platformFocus?: string[];
  brandKeywords?: string[];
  forbiddenPhrases?: string[];
  writingStyle?: string | null;
  postingGoals?: string | null;
};

export type BrandProfileUpdate = Partial<BrandProfileInput>;

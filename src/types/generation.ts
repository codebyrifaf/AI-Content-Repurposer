import type { UsageSnapshot } from "@/types/usage";

export type GenerationInput = {
  niche: string;
  audience: string;
  topic: string;
  tone: string;
  weeklyGoal?: WeeklyGoal | string | null;
  platformFocus?: string[] | null;
};

export type ContentTemplateId =
  | "authority"
  | "engagement"
  | "conversion"
  | "launch";

export const WEEKLY_GOALS = [
  "build trust",
  "educate audience",
  "promote offer",
  "generate leads",
  "increase engagement",
  "announce update",
  "nurture community",
] as const;

export type WeeklyGoal = (typeof WEEKLY_GOALS)[number];

export type GenerationRequest = GenerationInput & {
  brandProfileId?: string | null;
  contentTemplateId?: ContentTemplateId | null;
};

export type ContentStrategy = {
  postingAngle: string;
  painPoint: string;
  engagementStrategy: string;
};

export type CarouselPack = {
  title: string;
  slides: string[];
};

export type ReelScript = {
  hook: string;
  talkingPoints: string[];
  cta: string;
};

export type PinterestPin = {
  title: string;
  description: string;
  visualIdea: string;
};

export type WeeklyPlanDay = {
  day: string;
  platform: string;
  postType: string;
  goal: string;
  engagementFocus: string;
};

export type CTAVariations = {
  soft: string;
  aggressive: string;
  curiosity: string;
  leadMagnet: string;
};

export type CaptionVariation = {
  style: string;
  caption: string;
};

export type HookVariation = {
  format: string;
  hook: string;
};

export type WeeklyWorkflowSummary = {
  strategySummary: string;
  contentTheme: string;
  audienceAngle?: string | null;
  platformFocus?: string[];
  postingSequence: string[];
  recommendedContentOrder?: string[];
  carouselConcept?: string | null;
  reelConcept?: string | null;
  repurposeIdea?: string | null;
};

export type GenerationContext = {
  workflowMode?: "weekly-marketing-workflow";
  weeklyGoal?: string | null;
  platformFocus?: string[];
  brandProfileId?: string | null;
  brandProfileName?: string | null;
  contentTemplateId?: string | null;
  contentTemplateName?: string | null;
};

export type ContentPackOutput = {
  version: "content-pack-v1";
  strategy: ContentStrategy;
  carousel: CarouselPack;
  reelScript: ReelScript;
  pinterestPins: PinterestPin[];
  weeklyPlan: WeeklyPlanDay[];
  ctaVariations: CTAVariations;
  engagementPrompts: string[];
  captionVariations: CaptionVariation[];
  hookVariations: HookVariation[];
  weeklyWorkflow?: WeeklyWorkflowSummary;
  generationContext?: GenerationContext;
};

export type LegacyGenerationOutput = {
  pinterestTitles: string[];
  pinterestDescriptions: string[];
  instagramCaption: string;
  linkedinPost: string;
  hashtags: string[];
  canvaIdea: string;
  videoHook: string;
  postingAngle: string;
  painPoint: string;
  engagementStrategy: string;
};

export type GenerationOutput = ContentPackOutput | LegacyGenerationOutput;

export type GenerationRecord = {
  id: string;
  userId: string;
  niche: string;
  audience: string | null;
  topic: string;
  tone: string | null;
  result: GenerationOutput;
  createdAt: string;
};

export type GenerationResponse =
  | {
      success: true;
      data: GenerationOutput;
      record: GenerationRecord;
      usage: UsageSnapshot;
    }
  | { success: false; error: string; usage?: UsageSnapshot };

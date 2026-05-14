"use client";

import {
  useMemo,
  useState,
  useEffect,
  useRef,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { BrandProfileModal } from "@/components/brand/BrandProfileModal";
import { UpgradeModal } from "@/components/billing/UpgradeModal";
import {
  OnboardingModal,
  type OnboardingSample,
} from "@/components/dashboard/OnboardingModal";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/Toast";
import { getBrandProfileQuality } from "@/lib/brand-profiles/quality";
import {
  buildContentPackMarkdown,
  buildContentPackText,
  buildLegacyMarkdown,
  buildLegacyText,
} from "@/lib/content-pack/format";
import {
  isContentPackOutput,
  isLegacyGenerationOutput,
} from "@/lib/content-pack/guards";
import { CONTENT_TEMPLATE_OPTIONS } from "@/lib/prompts/templates";
import { cn } from "@/lib/utils";
import type { BrandProfile, BrandProfileInput } from "@/types/brand-profile";
import type {
  ContentPackOutput,
  ContentTemplateId,
  GenerationInput,
  GenerationOutput,
  GenerationRecord,
  GenerationResponse,
  LegacyGenerationOutput,
  WeeklyGoal,
} from "@/types/generation";
import type { UsageSnapshot } from "@/types/usage";

const initialInput: GenerationInput = {
  niche: "",
  audience: "",
  topic: "",
  tone: "",
  weeklyGoal: "increase engagement",
  platformFocus: [],
};

const toneOptions = [
  "Confident",
  "Warm",
  "Bold",
  "Friendly",
  "Minimal",
  "Luxury",
];

const weeklyGoalOptions: WeeklyGoal[] = [
  "build trust",
  "educate audience",
  "promote offer",
  "generate leads",
  "increase engagement",
  "announce update",
  "nurture community",
];

const workflowPlatformOptions = [
  "Instagram",
  "TikTok",
  "LinkedIn",
  "Pinterest",
  "YouTube Shorts",
  "Facebook",
];

const generationLoadingStages = [
  "Reading brand profile context...",
  "Applying content template psychology...",
  "Building weekly strategy...",
  "Generating structured content pack...",
] as const;

const onboardingKey = "cf:onboarding:v1";
const activeBrandProfileKey = "cf:active-brand-profile:v1";
const activeTemplateKey = "cf:active-template:v1";
const defaultTemplateId: ContentTemplateId = "authority";

const onboardingSamples: OnboardingSample[] = [
  {
    label: "Realtor open house",
    input: {
      niche: "Realtor",
      audience: "First-time buyers",
      topic: "Weekend open house for downtown condos",
      tone: "Confident",
      weeklyGoal: "generate leads",
    },
  },
  {
    label: "Gym strength plan",
    input: {
      niche: "Gym",
      audience: "Busy professionals",
      topic: "4-week strength starter plan",
      tone: "Bold",
      weeklyGoal: "increase engagement",
    },
  },
  {
    label: "Restaurant tasting menu",
    input: {
      niche: "Restaurant",
      audience: "Date-night diners",
      topic: "Chef's weekend tasting menu",
      tone: "Warm",
      weeklyGoal: "promote offer",
    },
  },
  {
    label: "Coach client wins",
    input: {
      niche: "Business coach",
      audience: "Solo founders with inconsistent sales",
      topic: "Weekly framework for predictable client acquisition",
      tone: "Confident",
      weeklyGoal: "build trust",
    },
  },
  {
    label: "Consultant audit offer",
    input: {
      niche: "Consultant",
      audience: "Local service businesses with low online conversions",
      topic: "5-page conversion audit launch week",
      tone: "Minimal",
      weeklyGoal: "promote offer",
    },
  },
  {
    label: "Local plumbing tips",
    input: {
      niche: "Local service business",
      audience: "Homeowners with urgent maintenance issues",
      topic: "Preventive plumbing checklist before monsoon season",
      tone: "Friendly",
      weeklyGoal: "educate audience",
    },
  },
];

type BrandProfilesResponse = {
  data?: BrandProfile[];
  error?: string;
};

type BrandProfileResponse = {
  data?: BrandProfile;
  error?: string;
};

type BrandProfileDeleteResponse = {
  success?: boolean;
  error?: string;
};

type SidebarSection =
  | "workflow"
  | "history"
  | "profiles"
  | "templates"
  | "account";

type DocumentSectionProps = {
  title: string;
  copyText?: string;
  defaultOpen?: boolean;
  children: ReactNode;
};

type DashboardDocumentProps = {
  pack: ContentPackOutput;
};

type LegacyDocumentProps = {
  legacy: LegacyGenerationOutput;
};

function renderParagraphs(text: string) {
  return text
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph, index) => (
      <p key={`${index}-${paragraph}`} className="text-sm leading-7 text-foreground">
        {paragraph}
      </p>
    ));
}

function formatFileName(topic: string, extension: string) {
  const base = topic
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `content-pack-${base || "export"}.${extension}`;
}

function downloadTextFile(filename: string, content: string) {
  if (typeof window === "undefined") {
    return;
  }
  const blob = new Blob([content], { type: "text/plain" });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.URL.revokeObjectURL(url);
}

function formatWorkspaceOwner(email: string) {
  const value = email.trim();
  if (!value) {
    return "Workspace";
  }

  const [localPart] = value.split("@");
  const words = localPart
    .split(/[._-]+/)
    .map((item) => item.trim())
    .filter(Boolean);

  if (words.length === 0) {
    return value;
  }

  return words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function extractWorkflowGoal(output: GenerationOutput | null | undefined): string | null {
  if (!output || !isContentPackOutput(output)) {
    return null;
  }

  const goal = output.generationContext?.weeklyGoal;
  return typeof goal === "string" && goal.trim().length > 0 ? goal.trim() : null;
}

function extractWorkflowPlatformFocus(
  output: GenerationOutput | null | undefined
): string[] {
  if (!output || !isContentPackOutput(output)) {
    return [];
  }

  const platforms = output.generationContext?.platformFocus;
  if (!Array.isArray(platforms)) {
    return [];
  }

  return platforms
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .slice(0, 3);
}

function DocumentSection({
  title,
  copyText,
  children,
  defaultOpen = true,
}: DocumentSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="border-t border-border/20 pt-6 first:border-t-0 first:pt-0">
      <div className="flex items-start justify-between gap-3">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="text-left transition hover:text-foreground"
          aria-expanded={open}
        >
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <p className="mt-0.5 text-xs text-muted">{open ? "Collapse" : "Expand"}</p>
        </button>
        {copyText ? <CopyButton text={copyText} label="Copy section" /> : null}
      </div>
      {open ? <div className="mt-4 space-y-4">{children}</div> : null}
    </section>
  );
}

function DashboardDocument({ pack }: DashboardDocumentProps) {
  const postingSequence =
    pack.weeklyWorkflow?.postingSequence?.length &&
    pack.weeklyWorkflow.postingSequence.length > 0
      ? pack.weeklyWorkflow.postingSequence
      : pack.weeklyPlan.map((day) => `${day.day}: ${day.platform} - ${day.postType}`);

  const repurposeIdea =
    pack.weeklyWorkflow?.repurposeIdea ??
    pack.pinterestPins[0]?.visualIdea ??
    "Repurpose your strongest carousel into short-form video and a pin.";

  return (
    <div className="space-y-7">
      <DocumentSection
        title="Weekly Strategy"
        copyText={`${pack.strategy.postingAngle}\n${pack.strategy.painPoint}\n${pack.strategy.engagementStrategy}`}
      >
        <div className="space-y-2">
          <p className="text-sm text-muted">Posting angle</p>
          <p className="text-sm leading-7 text-foreground">{pack.strategy.postingAngle}</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-muted">Audience pain point</p>
          <p className="text-sm leading-7 text-foreground">{pack.strategy.painPoint}</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-muted">Engagement strategy</p>
          <p className="text-sm leading-7 text-foreground">{pack.strategy.engagementStrategy}</p>
        </div>
      </DocumentSection>

      <DocumentSection
        title="Content Theme"
        copyText={[
          pack.weeklyWorkflow?.strategySummary,
          pack.weeklyWorkflow?.contentTheme,
          pack.weeklyWorkflow?.audienceAngle,
        ]
          .filter(Boolean)
          .join("\n")}
      >
        {pack.weeklyWorkflow ? (
          <>
            <div className="space-y-2">
              <p className="text-sm text-muted">Strategy summary</p>
              <p className="text-sm leading-7 text-foreground">
                {pack.weeklyWorkflow.strategySummary}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted">Content theme</p>
              <p className="text-sm leading-7 text-foreground">
                {pack.weeklyWorkflow.contentTheme}
              </p>
            </div>
            {pack.weeklyWorkflow.audienceAngle ? (
              <div className="space-y-2">
                <p className="text-sm text-muted">Audience angle</p>
                <p className="text-sm leading-7 text-foreground">
                  {pack.weeklyWorkflow.audienceAngle}
                </p>
              </div>
            ) : null}
          </>
        ) : (
          <p className="text-sm text-muted">
            Generate again to include the extended weekly workflow summary.
          </p>
        )}
      </DocumentSection>

      <DocumentSection title="Posting Sequence" copyText={postingSequence.join("\n")}>
        <ol className="space-y-2">
          {postingSequence.map((step, index) => (
            <li key={`${index}-${step}`} className="text-sm leading-7 text-foreground">
              {index + 1}. {step}
            </li>
          ))}
        </ol>
      </DocumentSection>

      <DocumentSection
        title="Carousel Idea"
        copyText={[pack.carousel.title, ...pack.carousel.slides].join("\n")}
      >
        <p className="text-sm leading-7 text-foreground">{pack.carousel.title}</p>
        <ol className="space-y-2">
          {pack.carousel.slides.map((slide, index) => (
            <li key={`${index}-${slide}`} className="text-sm leading-7 text-foreground">
              {index + 1}. {slide}
            </li>
          ))}
        </ol>
      </DocumentSection>

      <DocumentSection
        title="Reel/TikTok Idea"
        copyText={[
          pack.reelScript.hook,
          ...pack.reelScript.talkingPoints,
          pack.reelScript.cta,
        ].join("\n")}
      >
        <p className="text-base font-semibold text-foreground">{pack.reelScript.hook}</p>
        <ol className="space-y-2">
          {pack.reelScript.talkingPoints.map((point, index) => (
            <li key={`${index}-${point}`} className="text-sm leading-7 text-foreground">
              {index + 1}. {point}
            </li>
          ))}
        </ol>
        <p className="text-sm text-muted">CTA: {pack.reelScript.cta}</p>
      </DocumentSection>

      <DocumentSection
        title="Captions"
        copyText={pack.captionVariations
          .map((item) => `${item.style}: ${item.caption}`)
          .join("\n\n")}
      >
        <div className="space-y-4">
          {pack.captionVariations.map((item, index) => (
            <div key={`${index}-${item.style}`} className="space-y-1">
              <p className="text-xs text-muted">{item.style}</p>
              <div className="space-y-2">{renderParagraphs(item.caption)}</div>
            </div>
          ))}
        </div>
      </DocumentSection>

      <DocumentSection
        title="Hooks"
        copyText={pack.hookVariations.map((item) => `${item.format}: ${item.hook}`).join("\n")}
      >
        <ul className="space-y-2">
          {pack.hookVariations.map((item, index) => (
            <li key={`${index}-${item.format}`} className="text-sm leading-7 text-foreground">
              <span className="text-muted">{item.format}:</span> {item.hook}
            </li>
          ))}
        </ul>
      </DocumentSection>

      <DocumentSection
        title="CTA Variations"
        copyText={`Soft: ${pack.ctaVariations.soft}\nAggressive: ${pack.ctaVariations.aggressive}\nCuriosity: ${pack.ctaVariations.curiosity}\nLead magnet: ${pack.ctaVariations.leadMagnet}`}
      >
        <ul className="space-y-2">
          <li className="text-sm leading-7 text-foreground">
            <span className="text-muted">Soft:</span> {pack.ctaVariations.soft}
          </li>
          <li className="text-sm leading-7 text-foreground">
            <span className="text-muted">Aggressive:</span> {pack.ctaVariations.aggressive}
          </li>
          <li className="text-sm leading-7 text-foreground">
            <span className="text-muted">Curiosity:</span> {pack.ctaVariations.curiosity}
          </li>
          <li className="text-sm leading-7 text-foreground">
            <span className="text-muted">Lead magnet:</span> {pack.ctaVariations.leadMagnet}
          </li>
        </ul>
      </DocumentSection>

      <DocumentSection
        title="Engagement Prompts"
        copyText={pack.engagementPrompts.join("\n")}
      >
        <ul className="space-y-2">
          {pack.engagementPrompts.map((prompt, index) => (
            <li key={`${index}-${prompt}`} className="text-sm leading-7 text-foreground">
              {prompt}
            </li>
          ))}
        </ul>
      </DocumentSection>

      <DocumentSection title="Repurpose Idea" copyText={repurposeIdea}>
        <p className="text-sm leading-7 text-foreground">{repurposeIdea}</p>
      </DocumentSection>

      <DocumentSection
        title="Publishing Planner"
        defaultOpen={false}
        copyText={pack.weeklyPlan
          .map(
            (day) =>
              `${day.day}: ${day.platform} - ${day.postType}. Goal: ${day.goal}. Engagement: ${day.engagementFocus}.`
          )
          .join("\n")}
      >
        <div className="divide-y divide-border/20">
          {pack.weeklyPlan.map((day) => (
            <div key={`${day.day}-${day.platform}`} className="py-3 first:pt-0 last:pb-0">
              <p className="text-xs text-muted">{day.day}</p>
              <p className="mt-1 text-sm text-foreground">
                {day.platform} - {day.postType}
              </p>
              <p className="mt-1 text-xs text-muted">Goal: {day.goal}</p>
              <p className="mt-1 text-xs text-muted">Engagement: {day.engagementFocus}</p>
            </div>
          ))}
        </div>
      </DocumentSection>
    </div>
  );
}

function LegacyDocument({ legacy }: LegacyDocumentProps) {
  return (
    <div className="space-y-7">
      <p className="text-sm text-muted">
        Legacy output format detected. Fresh generations now use the weekly plan document layout.
      </p>
      <DocumentSection
        title="Weekly Strategy"
        copyText={`${legacy.postingAngle}\n${legacy.painPoint}\n${legacy.engagementStrategy}`}
      >
        <p className="text-sm leading-7 text-foreground">{legacy.postingAngle}</p>
        <p className="text-sm leading-7 text-foreground">{legacy.painPoint}</p>
        <p className="text-sm leading-7 text-foreground">{legacy.engagementStrategy}</p>
      </DocumentSection>
      <DocumentSection title="Pinterest Titles" copyText={legacy.pinterestTitles.join("\n")}>
        <ul className="space-y-2">
          {legacy.pinterestTitles.map((title, index) => (
            <li key={`${index}-${title}`} className="text-sm text-foreground">
              {title}
            </li>
          ))}
        </ul>
      </DocumentSection>
      <DocumentSection
        title="Pinterest Descriptions"
        copyText={legacy.pinterestDescriptions.join("\n")}
      >
        <ul className="space-y-2">
          {legacy.pinterestDescriptions.map((description, index) => (
            <li key={`${index}-${description}`} className="text-sm text-foreground">
              {description}
            </li>
          ))}
        </ul>
      </DocumentSection>
      <DocumentSection title="Instagram Caption" copyText={legacy.instagramCaption}>
        <div className="space-y-2">{renderParagraphs(legacy.instagramCaption)}</div>
      </DocumentSection>
      <DocumentSection title="LinkedIn Post" copyText={legacy.linkedinPost}>
        <div className="space-y-2">{renderParagraphs(legacy.linkedinPost)}</div>
      </DocumentSection>
      <DocumentSection title="Hashtags" copyText={legacy.hashtags.join(" ")}>
        <div className="flex flex-wrap gap-2">
          {legacy.hashtags.map((tag, index) => (
            <Badge key={`${index}-${tag}`}>{tag}</Badge>
          ))}
        </div>
      </DocumentSection>
      <DocumentSection title="Canva Idea" copyText={legacy.canvaIdea}>
        <p className="text-sm text-foreground">{legacy.canvaIdea}</p>
      </DocumentSection>
      <DocumentSection title="Short-form Video Hook" copyText={legacy.videoHook}>
        <p className="text-base font-semibold text-foreground">{legacy.videoHook}</p>
      </DocumentSection>
    </div>
  );
}

type DashboardClientProps = {
  initialHistory: GenerationRecord[];
  initialUsage: UsageSnapshot;
  userEmail: string;
};

export function DashboardClient({
  initialHistory,
  initialUsage,
  userEmail,
}: DashboardClientProps) {
  const initialItem = initialHistory[0];
  const [input, setInput] = useState<GenerationInput>(() =>
    initialItem
      ? {
          niche: initialItem.niche,
          audience: initialItem.audience ?? "",
          topic: initialItem.topic,
          tone: initialItem.tone ?? "",
          weeklyGoal:
            extractWorkflowGoal(initialItem.result) ?? initialInput.weeklyGoal,
          platformFocus: extractWorkflowPlatformFocus(initialItem.result),
        }
      : initialInput
  );
  const [result, setResult] = useState<GenerationOutput | null>(
    initialItem?.result ?? null
  );
  const [history, setHistory] = useState<GenerationRecord[]>(initialHistory);
  const [activeId, setActiveId] = useState<string | null>(initialItem?.id ?? null);
  const [activeSidebarSection, setActiveSidebarSection] =
    useState<SidebarSection>("workflow");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [templateDetailsOpen, setTemplateDetailsOpen] = useState(false);
  const [advancedOptionsOpen, setAdvancedOptionsOpen] = useState(false);
  const { pushToast } = useToast();
  const [usage, setUsage] = useState<UsageSnapshot>(initialUsage);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [brandProfiles, setBrandProfiles] = useState<BrandProfile[]>([]);
  const [brandProfilesLoading, setBrandProfilesLoading] = useState(true);
  const [brandProfilesError, setBrandProfilesError] = useState<string | null>(null);
  const [brandModalOpen, setBrandModalOpen] = useState(false);
  const [editingBrandProfile, setEditingBrandProfile] = useState<BrandProfile | null>(
    null
  );
  const [brandActionLoading, setBrandActionLoading] = useState(false);
  const [activeBrandProfileId, setActiveBrandProfileId] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] =
    useState<ContentTemplateId>(defaultTemplateId);
  const [loading, setLoading] = useState(false);
  const [loadingStageIndex, setLoadingStageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const accountMenuRef = useRef<HTMLDivElement | null>(null);

  const dateFormatter = useMemo(
    () => new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }),
    []
  );
  const isFreePlan = usage.subscriptionStatus === "free";
  const remaining = usage.remaining;
  const limitReached = isFreePlan && remaining !== null && remaining <= 0;
  const resetLabel = isFreePlan
    ? dateFormatter.format(new Date(usage.monthlyResetDate))
    : null;

  const activeBrandProfile = useMemo(
    () => brandProfiles.find((profile) => profile.id === activeBrandProfileId) ?? null,
    [brandProfiles, activeBrandProfileId]
  );
  const activeTemplate = useMemo(
    () =>
      CONTENT_TEMPLATE_OPTIONS.find(
        (template) => template.id === selectedTemplateId
      ) ?? CONTENT_TEMPLATE_OPTIONS[0],
    [selectedTemplateId]
  );
  const activeBrandProfileQuality = useMemo(
    () => (activeBrandProfile ? getBrandProfileQuality(activeBrandProfile) : null),
    [activeBrandProfile]
  );
  const loadingStage =
    loading &&
    generationLoadingStages[
      Math.min(loadingStageIndex, generationLoadingStages.length - 1)
    ];
  const isAiUnavailableError =
    typeof error === "string" &&
    error.toLowerCase().includes("temporarily unavailable");
  const contentPackResult = result && isContentPackOutput(result) ? result : null;
  const legacyResult = result && isLegacyGenerationOutput(result) ? result : null;
  const historyPreview = history.slice(0, 8);
  const activeGoalLabel =
    typeof input.weeklyGoal === "string" && input.weeklyGoal.trim().length > 0
      ? input.weeklyGoal
      : "increase engagement";
  const workspaceOwner = useMemo(() => formatWorkspaceOwner(userEmail), [userEmail]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const seen = window.localStorage.getItem(onboardingKey);
    if (!seen) {
      setOnboardingOpen(true);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const savedTemplate = window.localStorage.getItem(activeTemplateKey);
    const isValidTemplate = CONTENT_TEMPLATE_OPTIONS.some(
      (template) => template.id === savedTemplate
    );
    if (savedTemplate && isValidTemplate) {
      setSelectedTemplateId(savedTemplate as ContentTemplateId);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(activeTemplateKey, selectedTemplateId);
  }, [selectedTemplateId]);

  useEffect(() => {
    let active = true;

    const loadBrandProfiles = async () => {
      setBrandProfilesLoading(true);
      setBrandProfilesError(null);
      try {
        const response = await fetch("/api/brand-profiles");
        const payload = (await response.json()) as BrandProfilesResponse;

        if (!response.ok || !payload.data) {
          throw new Error(payload.error ?? "Unable to load brand profiles.");
        }

        if (!active) {
          return;
        }

        setBrandProfiles(payload.data);

        const savedActiveId =
          typeof window !== "undefined"
            ? window.localStorage.getItem(activeBrandProfileKey)
            : null;
        const activeProfile =
          payload.data.find((profile) => profile.id === savedActiveId) ??
          payload.data[0] ??
          null;
        setActiveBrandProfileId(activeProfile?.id ?? null);
      } catch (err) {
        if (!active) {
          return;
        }
        const message =
          err instanceof Error ? err.message : "Unable to load brand profiles.";
        setBrandProfilesError(message);
      } finally {
        if (active) {
          setBrandProfilesLoading(false);
        }
      }
    };

    void loadBrandProfiles();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    if (!activeBrandProfileId) {
      window.localStorage.removeItem(activeBrandProfileKey);
      return;
    }
    window.localStorage.setItem(activeBrandProfileKey, activeBrandProfileId);
  }, [activeBrandProfileId]);

  useEffect(() => {
    if (brandProfiles.length === 0) {
      if (activeBrandProfileId !== null) {
        setActiveBrandProfileId(null);
      }
      return;
    }

    if (
      activeBrandProfileId &&
      brandProfiles.some((profile) => profile.id === activeBrandProfileId)
    ) {
      return;
    }

    setActiveBrandProfileId(brandProfiles[0].id);
  }, [brandProfiles, activeBrandProfileId]);

  useEffect(() => {
    if (!loading) {
      setLoadingStageIndex(0);
      return;
    }

    setLoadingStageIndex(0);
    const intervalId = window.setInterval(() => {
      setLoadingStageIndex((prev) =>
        Math.min(prev + 1, generationLoadingStages.length - 1)
      );
    }, 1400);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [loading]);

  useEffect(() => {
    if (!accountMenuOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }
      if (!accountMenuRef.current?.contains(target)) {
        setAccountMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setAccountMenuOpen(false);
      }
    };

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [accountMenuOpen]);

  const isFormValid = useMemo(
    () => {
      const hasTopic = input.topic.trim().length > 0;
      return hasTopic && !loading;
    },
    [input.topic, loading]
  );

  const handleTextChange =
    (field: "niche" | "audience" | "topic" | "tone") =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setInput((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handlePlatformFocusChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value.trim();
    setInput((prev) => ({
      ...prev,
      platformFocus: value ? [value] : [],
    }));
  };

  const handleStartNewPlan = () => {
    setResult(null);
    setActiveId(null);
    setError(null);
    setActiveSidebarSection("workflow");
    setAdvancedOptionsOpen(false);
    setAccountMenuOpen(false);
    setMobileSidebarOpen(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isFormValid) {
      return;
    }
    if (limitReached) {
      setUpgradeOpen(true);
      return;
    }

    const topic = input.topic.trim();
    const niche =
      input.niche.trim() ||
      activeBrandProfile?.businessDescription?.trim() ||
      activeBrandProfile?.name.trim() ||
      "General business";
    const audience =
      input.audience.trim() ||
      activeBrandProfile?.targetAudience?.trim() ||
      "Online audience";
    const tone =
      input.tone.trim() ||
      activeBrandProfile?.toneOfVoice?.trim() ||
      "Confident";
    const weeklyGoal =
      typeof input.weeklyGoal === "string" && input.weeklyGoal.trim().length > 0
        ? input.weeklyGoal.trim()
        : "increase engagement";
    const platformFocus = (input.platformFocus ?? [])
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 1);

    setInput((prev) => ({
      ...prev,
      topic,
      niche,
      audience,
      tone,
      weeklyGoal,
      platformFocus,
    }));

    setLoading(true);
    setError(null);
    setActiveSidebarSection("workflow");
    setAccountMenuOpen(false);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          niche,
          audience,
          topic,
          tone,
          weeklyGoal,
          platformFocus,
          brandProfileId: activeBrandProfileId,
          contentTemplateId: selectedTemplateId,
        }),
      });

      const payload = (await response.json()) as GenerationResponse;

      if (!response.ok || !payload.success) {
        if (!payload.success && payload.usage) {
          setUsage(payload.usage);
        }
        if (response.status === 429) {
          setUpgradeOpen(true);
        }
        const message = payload.success ? "Generation failed." : payload.error;
        throw new Error(message);
      }

      setResult(payload.data);
      setUsage(payload.usage);
      setActiveId(payload.record.id);
      setHistory((prev) => [
        payload.record,
        ...prev.filter((item) => item.id !== payload.record.id),
      ]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error";
      const safeMessage =
        /failed to fetch|networkerror|temporarily unavailable/i.test(message)
          ? "AI is temporarily unavailable. Please try again in a moment."
          : /invalid|content pack|incomplete|unable/i.test(message)
            ? "We could not create a valid content pack this time."
            : "The AI response was incomplete. Please try again.";
      setError(safeMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (item: GenerationRecord) => {
    setActiveId(item.id);
    setResult(item.result);
    setInput((prev) => ({
      niche: item.niche,
      audience: item.audience ?? "",
      topic: item.topic,
      tone: item.tone ?? "",
      weeklyGoal:
        extractWorkflowGoal(item.result) ?? prev.weeklyGoal ?? "increase engagement",
      platformFocus: extractWorkflowPlatformFocus(item.result),
    }));
    setError(null);
    setActiveSidebarSection("workflow");
    setAccountMenuOpen(false);
    setMobileSidebarOpen(false);
  };

  const handleOnboardingClose = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(onboardingKey, "seen");
    }
    setOnboardingOpen(false);
  };

  const handleLoadSample = (sample: OnboardingSample) => {
    setInput((prev) => ({
      ...prev,
      ...sample.input,
      weeklyGoal: sample.input.weeklyGoal ?? "increase engagement",
      platformFocus: sample.input.platformFocus ?? [],
    }));
    setResult(null);
    setActiveId(null);
    setError(null);
    handleOnboardingClose();
    pushToast({
      title: "Sample loaded",
      description: "Review the inputs and generate when ready.",
      tone: "info",
    });
    setActiveSidebarSection("workflow");
    setAccountMenuOpen(false);
    setMobileSidebarOpen(false);
  };

  const handleOpenCreateBrandProfile = () => {
    setEditingBrandProfile(null);
    setBrandModalOpen(true);
    setAccountMenuOpen(false);
    setMobileSidebarOpen(false);
  };

  const handleOpenEditBrandProfile = () => {
    if (!activeBrandProfile) {
      return;
    }
    setEditingBrandProfile(activeBrandProfile);
    setBrandModalOpen(true);
    setAccountMenuOpen(false);
    setMobileSidebarOpen(false);
  };

  const handleSaveBrandProfile = async (payload: BrandProfileInput) => {
    setBrandActionLoading(true);
    try {
      const editingId = editingBrandProfile?.id ?? null;
      const isEdit = Boolean(editingId);
      const endpoint = isEdit
        ? `/api/brand-profiles/${editingId}`
        : "/api/brand-profiles";
      const method = isEdit ? "PATCH" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const saveResult = (await response.json()) as BrandProfileResponse;
      if (!response.ok || !saveResult.data) {
        throw new Error(saveResult.error ?? "Unable to save brand profile.");
      }

      const savedProfile = saveResult.data;
      setBrandProfiles((prev) => {
        const withoutSaved = prev.filter((profile) => profile.id !== savedProfile.id);
        return [savedProfile, ...withoutSaved];
      });
      setActiveBrandProfileId(savedProfile.id);
      setEditingBrandProfile(null);
      pushToast({
        title: isEdit ? "Profile updated" : "Profile created",
        description: `${savedProfile.name} is now active in your workspace.`,
        tone: "success",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to save profile.";
      pushToast({
        title: "Save failed",
        description: message,
        tone: "error",
      });
      throw err;
    } finally {
      setBrandActionLoading(false);
    }
  };

  const handleDeleteBrandProfile = async () => {
    if (!activeBrandProfile) {
      return;
    }

    const confirmed = window.confirm(
      `Delete "${activeBrandProfile.name}"? This cannot be undone.`
    );
    if (!confirmed) {
      return;
    }

    setBrandActionLoading(true);
    try {
      const response = await fetch(`/api/brand-profiles/${activeBrandProfile.id}`, {
        method: "DELETE",
      });
      const payload = (await response.json()) as BrandProfileDeleteResponse;
      if (!response.ok || !payload.success) {
        throw new Error(payload.error ?? "Unable to delete profile.");
      }

      setBrandProfiles((prev) =>
        prev.filter((profile) => profile.id !== activeBrandProfile.id)
      );
      pushToast({
        title: "Profile deleted",
        description: `"${activeBrandProfile.name}" was removed.`,
        tone: "success",
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to delete profile.";
      pushToast({
        title: "Delete failed",
        description: message,
        tone: "error",
      });
    } finally {
      setBrandActionLoading(false);
    }
  };

  const handleUpgrade = async () => {
    if (upgradeLoading) {
      return;
    }
    setUpgradeLoading(true);
    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: "pro" }),
      });

      const payload = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !payload.url) {
        throw new Error(payload.error ?? "Checkout is not configured yet.");
      }

      window.location.href = payload.url;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upgrade failed.";
      pushToast({
        title: "Upgrade unavailable",
        description: message,
        tone: "error",
      });
    } finally {
      setUpgradeLoading(false);
    }
  };

  const handleCopyPack = async () => {
    if (!result) {
      return;
    }

    const content = isContentPackOutput(result)
      ? buildContentPackText(result)
      : isLegacyGenerationOutput(result)
        ? buildLegacyText(result)
        : "";

    if (!content) {
      return;
    }

    try {
      await navigator.clipboard.writeText(content);
      pushToast({
        title: "Content pack copied",
        description: "Ready to paste into your workflow.",
        tone: "success",
      });
    } catch {
      pushToast({
        title: "Copy failed",
        description: "Your browser blocked clipboard access.",
        tone: "error",
      });
    }
  };

  const handleExportMarkdown = () => {
    if (!result) {
      return;
    }
    const content = isContentPackOutput(result)
      ? buildContentPackMarkdown(result)
      : isLegacyGenerationOutput(result)
        ? buildLegacyMarkdown(result)
        : "";
    if (!content) {
      return;
    }
    downloadTextFile(formatFileName(input.topic || "content-pack", "md"), content);
  };

  const handleExportText = () => {
    if (!result) {
      return;
    }
    const content = isContentPackOutput(result)
      ? buildContentPackText(result)
      : isLegacyGenerationOutput(result)
        ? buildLegacyText(result)
        : "";
    if (!content) {
      return;
    }
    downloadTextFile(formatFileName(input.topic || "content-pack", "txt"), content);
  };

  const sidebarButtonClass = (section: SidebarSection) =>
    cn(
      "w-full rounded-lg px-2.5 py-2 text-left text-sm leading-5 transition",
      activeSidebarSection === section
        ? "bg-surface/45 text-foreground"
        : "text-muted hover:bg-surface/20 hover:text-foreground"
    );

  const goalPillClass = (goal: WeeklyGoal) =>
    cn(
      "rounded-full border px-3 py-1 text-xs transition",
      input.weeklyGoal === goal
        ? "border-border/40 bg-surface/55 text-foreground"
        : "border-transparent bg-transparent text-muted hover:border-border/30 hover:text-foreground"
    );

  const usageSummary = isFreePlan
    ? `${remaining ?? 0} generations left`
    : "Unlimited generations";

  const openSidebarSection = (section: SidebarSection) => {
    setActiveSidebarSection(section);
    setAccountMenuOpen(false);
    setMobileSidebarOpen(false);
  };

  return (
    <>
      <div className="relative mx-auto w-full max-w-[1380px] px-4 py-4 sm:px-6 lg:py-6">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[280px] bg-[radial-gradient(circle_at_top,rgba(64,123,168,0.07),transparent_70%)]" />

        <div className="mb-4 flex items-center justify-between lg:hidden">
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            className="rounded-lg border border-border/25 bg-surface/25 px-3 py-2 text-sm text-foreground"
          >
            Menu
          </button>
          <Button size="sm" variant="ghost" onClick={handleStartNewPlan}>
            New plan
          </Button>
        </div>

        {mobileSidebarOpen ? (
          <div
            className="fixed inset-0 z-40 bg-slate-950/70 lg:hidden"
            aria-hidden
            onClick={() => {
              setMobileSidebarOpen(false);
              setAccountMenuOpen(false);
            }}
          />
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[232px_minmax(0,1fr)] xl:grid-cols-[232px_minmax(0,1fr)_248px] xl:gap-8">
          <aside
            className={cn(
              "z-50 lg:z-auto",
              "fixed inset-y-0 left-0 w-[82vw] max-w-[300px] border-r border-border/25 bg-background/95 p-4 backdrop-blur-xl transition lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)] lg:w-auto lg:max-w-none lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-0",
              mobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            )}
          >
            <div className="flex h-full flex-col gap-5 overflow-y-auto">
              <div className="space-y-0.5 px-1">
                <Link href="/" className="text-[2.5rem] font-semibold tracking-tight text-foreground">
                  ContentFlow
                </Link>
                <p className="text-[10px] uppercase tracking-[0.22em] text-muted/70">
                  Marketing workspace
                </p>
              </div>

              <nav className="space-y-4">
                <div className="space-y-1">
                  <p className="px-2.5 text-[10px] uppercase tracking-[0.22em] text-muted/70">
                    Workspace
                  </p>
                  <button type="button" className={sidebarButtonClass("workflow")} onClick={handleStartNewPlan}>
                    New weekly plan
                  </button>
                  <button
                    type="button"
                    className={sidebarButtonClass("history")}
                    onClick={() => openSidebarSection("history")}
                  >
                    History
                  </button>
                </div>
                <div className="space-y-1">
                  <p className="px-2.5 text-[10px] uppercase tracking-[0.22em] text-muted/70">
                    Library
                  </p>
                  <button
                    type="button"
                    className={sidebarButtonClass("profiles")}
                    onClick={() => openSidebarSection("profiles")}
                  >
                    Brand profiles
                  </button>
                  <button
                    type="button"
                    className={sidebarButtonClass("templates")}
                    onClick={() => openSidebarSection("templates")}
                  >
                    Templates
                  </button>
                </div>
              </nav>

              {historyPreview.length > 0 ? (
                <section className="space-y-1">
                  <p className="px-2.5 text-[10px] uppercase tracking-[0.22em] text-muted/70">
                    Recent
                  </p>
                  <div className="space-y-1">
                    {historyPreview.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelect(item)}
                        className={cn(
                          "w-full rounded-lg px-2.5 py-2 text-left text-xs transition",
                          item.id === activeId
                            ? "bg-surface/55 text-foreground"
                            : "text-muted hover:bg-surface/20 hover:text-foreground"
                        )}
                      >
                        <p className="truncate text-sm">{item.topic}</p>
                        <p className="mt-0.5">{dateFormatter.format(new Date(item.createdAt))}</p>
                      </button>
                    ))}
                  </div>
                </section>
              ) : null}

              <div className="mt-auto pt-2" ref={accountMenuRef}>
                <button
                  type="button"
                  onClick={() => setAccountMenuOpen((prev) => !prev)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-xl border border-transparent px-2.5 py-2 text-left transition",
                    accountMenuOpen
                      ? "bg-surface/45 text-foreground"
                      : "text-muted hover:bg-surface/20 hover:text-foreground"
                  )}
                  aria-expanded={accountMenuOpen}
                >
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface/65 text-sm font-semibold text-foreground">
                    {workspaceOwner.charAt(0).toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-foreground">{workspaceOwner}</span>
                    <span className="block text-xs text-muted">
                      {isFreePlan ? "Free plan" : "Pro plan"}
                      {isFreePlan ? ` - ${remaining ?? 0} left` : ""}
                    </span>
                  </span>
                  <span className={cn("text-[10px] transition", accountMenuOpen ? "rotate-180" : "")}>
                    v
                  </span>
                </button>

                {accountMenuOpen ? (
                  <div className="mt-2 space-y-1 rounded-xl border border-border/30 bg-background/90 p-1.5 shadow-lg shadow-slate-950/35 backdrop-blur">
                    <button
                      type="button"
                      className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm text-muted transition hover:bg-surface/25 hover:text-foreground"
                      onClick={() => {
                        setUpgradeOpen(true);
                        setAccountMenuOpen(false);
                      }}
                    >
                      <span>{isFreePlan ? "Upgrade" : "Manage plan"}</span>
                      <span className="text-[11px] text-muted/80">Billing</span>
                    </button>
                    <button
                      type="button"
                      className="w-full rounded-lg px-2.5 py-2 text-left text-sm text-muted transition hover:bg-surface/25 hover:text-foreground"
                      onClick={() => openSidebarSection("account")}
                    >
                      Settings
                    </button>
                    <Link
                      href="/"
                      className="block rounded-lg px-2.5 py-2 text-sm text-muted transition hover:bg-surface/25 hover:text-foreground"
                      onClick={() => setAccountMenuOpen(false)}
                    >
                      Back to site
                    </Link>
                    <button
                      type="button"
                      disabled
                      className="w-full rounded-lg px-2.5 py-2 text-left text-sm text-muted/60"
                    >
                      Switch workspace
                    </button>
                    <div className="border-t border-border/20 px-2.5 pt-2 text-[11px] text-muted">
                      Usage: {usageSummary}
                      {isFreePlan && resetLabel ? ` - resets ${resetLabel}` : ""}
                    </div>
                    <div className="[&_button]:h-auto [&_button]:w-full [&_button]:justify-start [&_button]:rounded-lg [&_button]:px-2.5 [&_button]:py-2 [&_button]:text-sm [&_button]:font-normal [&_button]:text-muted [&_button]:hover:bg-surface/25 [&_button]:hover:text-foreground">
                      <LogoutButton />
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </aside>

          <main className="min-w-0 pb-8 pt-3 sm:pt-5">
            {activeSidebarSection === "history" ? (
              <section className="mx-auto w-full max-w-3xl space-y-5">
                <header className="space-y-1.5">
                  <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                    History
                  </h1>
                  <p className="text-sm text-muted">Open a saved plan to continue working.</p>
                </header>
                {history.length === 0 ? (
                  <p className="text-sm text-muted">No saved plans yet.</p>
                ) : (
                  <div className="divide-y divide-border/20">
                    {history.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelect(item)}
                        className="flex w-full items-center justify-between gap-4 py-4 text-left transition hover:text-foreground"
                      >
                        <div>
                          <p className="text-base text-foreground">{item.topic}</p>
                          <p className="text-xs text-muted">
                            {item.niche} - {item.tone ?? "Neutral"}
                          </p>
                        </div>
                        <p className="text-xs text-muted">
                          {dateFormatter.format(new Date(item.createdAt))}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </section>
            ) : activeSidebarSection === "profiles" ? (
              <section className="mx-auto w-full max-w-3xl space-y-5">
                <header className="space-y-1.5">
                  <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                    Brand profiles
                  </h1>
                  <p className="text-sm text-muted">Keep outputs aligned to your business voice.</p>
                </header>

                {brandProfilesLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-11" />
                    <Skeleton className="h-11" />
                  </div>
                ) : brandProfiles.length === 0 ? (
                  <div className="space-y-3">
                    <p className="text-sm text-muted">
                      Create a brand profile to make outputs sound like your business.
                    </p>
                    <Button type="button" onClick={handleOpenCreateBrandProfile}>
                      Create profile
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <select
                      value={activeBrandProfileId ?? ""}
                      onChange={(event) =>
                        setActiveBrandProfileId(event.target.value || null)
                      }
                      className="w-full rounded-xl border border-border/40 bg-surface/25 px-4 py-3 text-sm text-foreground"
                    >
                      {brandProfiles.map((profile) => (
                        <option key={profile.id} value={profile.id}>
                          {profile.name}
                        </option>
                      ))}
                    </select>
                    <div className="flex flex-wrap items-center gap-3">
                      <Button type="button" size="sm" onClick={handleOpenCreateBrandProfile}>
                        Create
                      </Button>
                      <Button type="button" size="sm" variant="ghost" onClick={handleOpenEditBrandProfile}>
                        Edit
                      </Button>
                      <Button type="button" size="sm" variant="ghost" onClick={handleDeleteBrandProfile}>
                        Delete
                      </Button>
                      {activeBrandProfileQuality ? (
                        <Badge
                          className={cn(
                            activeBrandProfileQuality.level === "Strong profile"
                              ? "bg-emerald-500/20 text-emerald-100"
                              : activeBrandProfileQuality.level === "Needs more detail"
                                ? "bg-amber-500/20 text-amber-100"
                                : "bg-slate-500/20 text-slate-100"
                          )}
                        >
                          {activeBrandProfileQuality.level}
                        </Badge>
                      ) : null}
                    </div>
                    {activeBrandProfileQuality &&
                    activeBrandProfileQuality.missing.length > 0 ? (
                      <p className="text-xs text-muted">
                        Missing: {activeBrandProfileQuality.missing.join(", ")}
                      </p>
                    ) : null}
                  </div>
                )}

                {brandProfilesError ? (
                  <p className="text-sm text-red-200">{brandProfilesError}</p>
                ) : null}
              </section>
            ) : activeSidebarSection === "templates" ? (
              <section className="mx-auto w-full max-w-3xl space-y-5">
                <header className="space-y-1.5">
                  <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                    Templates
                  </h1>
                  <p className="text-sm text-muted">Adjust the strategy style for upcoming plans.</p>
                </header>
                <div className="space-y-3">
                  <select
                    value={selectedTemplateId}
                    onChange={(event) =>
                      setSelectedTemplateId(event.target.value as ContentTemplateId)
                    }
                    className="w-full rounded-xl border border-border/40 bg-surface/25 px-4 py-3 text-sm text-foreground"
                  >
                    {CONTENT_TEMPLATE_OPTIONS.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-sm text-muted">{activeTemplate.summary}</p>
                  <button
                    type="button"
                    className="text-xs text-muted hover:text-foreground"
                    onClick={() => setTemplateDetailsOpen((prev) => !prev)}
                  >
                    {templateDetailsOpen ? "Hide details" : "Show details"}
                  </button>
                  {templateDetailsOpen ? (
                    <p className="text-xs text-muted">
                      Affects hooks, CTA framing, structure, and psychology.
                    </p>
                  ) : null}
                </div>
              </section>
            ) : activeSidebarSection === "account" ? (
              <section className="mx-auto w-full max-w-3xl space-y-5">
                <header className="space-y-1.5">
                  <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                    Account
                  </h1>
                  <p className="text-sm text-muted">
                    Manage your plan, usage, and workspace settings.
                  </p>
                </header>
                <div className="space-y-2 text-sm text-muted">
                  <p>
                    Plan:{" "}
                    <span className="text-foreground">{isFreePlan ? "Free" : "Pro"}</span>
                  </p>
                  <p>
                    Usage:{" "}
                    <span className="text-foreground">
                      {isFreePlan ? `${remaining ?? 0} remaining` : "Unlimited"}
                    </span>
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button onClick={() => setUpgradeOpen(true)}>
                    {isFreePlan ? "Upgrade to Pro" : "Manage plan"}
                  </Button>
                  <Link
                    href="/"
                    className="inline-flex items-center rounded-full px-4 py-2 text-sm text-muted hover:bg-surface/30 hover:text-foreground"
                  >
                    Back to site
                  </Link>
                  <button
                    type="button"
                    onClick={() => setOnboardingOpen(true)}
                    className="text-sm text-muted transition hover:text-foreground"
                  >
                    Help
                  </button>
                </div>
              </section>
            ) : loading ? (
              <div className="mx-auto flex min-h-[560px] w-full max-w-3xl items-center justify-center">
                <div className="space-y-4 text-center">
                  <div className="mx-auto h-2 w-2 animate-pulse rounded-full bg-brand" />
                  <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                    Generating weekly plan
                  </h1>
                  <p className="text-sm text-muted">
                    {loadingStage ?? "Generating structured content pack..."}
                  </p>
                </div>
              </div>
            ) : contentPackResult ? (
              <div className="mx-auto w-full max-w-4xl space-y-8">
                <header className="space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-1.5">
                      <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-[2rem]">
                        {input.topic || "Weekly marketing plan"}
                      </h1>
                      <p className="text-xs text-muted">
                        Brand: {activeBrandProfile?.name ?? "None"} - Template: {activeTemplate.label} - Goal: {activeGoalLabel}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button size="sm" variant="secondary" onClick={handleCopyPack}>
                        Copy pack
                      </Button>
                      <Button size="sm" variant="ghost" onClick={handleExportMarkdown}>
                        Export markdown
                      </Button>
                      <Button size="sm" variant="ghost" onClick={handleExportText}>
                        Export text
                      </Button>
                      <Button size="sm" onClick={handleStartNewPlan}>
                        New plan
                      </Button>
                    </div>
                  </div>
                </header>
                <DashboardDocument pack={contentPackResult} />
              </div>
            ) : legacyResult ? (
              <div className="mx-auto w-full max-w-4xl space-y-8">
                <header className="space-y-3">
                  <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-[2rem]">
                    Legacy content output
                  </h1>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button size="sm" variant="secondary" onClick={handleCopyPack}>
                      Copy pack
                    </Button>
                    <Button size="sm" variant="ghost" onClick={handleExportMarkdown}>
                      Export markdown
                    </Button>
                    <Button size="sm" variant="ghost" onClick={handleExportText}>
                      Export text
                    </Button>
                    <Button size="sm" onClick={handleStartNewPlan}>
                      New plan
                    </Button>
                  </div>
                </header>
                <LegacyDocument legacy={legacyResult} />
              </div>
            ) : error ? (
              <div className="mx-auto flex min-h-[540px] w-full max-w-2xl items-center justify-center">
                <div className="space-y-4 text-center">
                  <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                    {isAiUnavailableError
                      ? "AI is temporarily unavailable."
                      : "The AI response was incomplete. Please try again."}
                  </h2>
                  <p className="text-sm text-muted">{error}</p>
                  <p className="text-sm text-muted">
                    Your usage was not charged for this failed generation.
                  </p>
                  <div className="flex flex-wrap justify-center gap-3">
                    <Button variant="secondary" onClick={() => setError(null)}>
                      Dismiss
                    </Button>
                    <Button onClick={() => setOnboardingOpen(true)}>Open examples</Button>
                  </div>
                </div>
              </div>
            ) : (
              <form className="mx-auto w-full max-w-3xl space-y-8 pb-6" onSubmit={handleSubmit}>
                <header className="space-y-3">
                  <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-[2.75rem]">
                    Build your weekly marketing plan
                  </h1>
                  <p className="max-w-2xl text-sm text-muted">
                    Choose your brand, set a weekly focus, and generate a structured content pack.
                  </p>
                  <p className="text-xs text-muted/90">
                    Brand: {activeBrandProfile?.name ?? "None"}
                    {activeBrandProfileQuality ? ` - ${activeBrandProfileQuality.level}` : ""}
                    {` - Template: ${activeTemplate.label} - Goal: ${activeGoalLabel}`}
                  </p>
                </header>

                <section className="space-y-3">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-muted/80">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-surface/45 text-[11px] text-foreground">
                      1
                    </span>
                    Brand profile
                  </div>
                  {brandProfilesLoading ? (
                    <Skeleton className="h-10 max-w-md" />
                  ) : brandProfiles.length === 0 ? (
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
                      <span>Create a brand profile to make outputs sound like your business.</span>
                      <Button type="button" size="sm" onClick={handleOpenCreateBrandProfile}>
                        Create profile
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <label htmlFor="brand-profile-select" className="text-sm text-muted">
                          Brand:
                        </label>
                        <select
                          id="brand-profile-select"
                          value={activeBrandProfileId ?? ""}
                          onChange={(event) =>
                            setActiveBrandProfileId(event.target.value || null)
                          }
                          className="min-w-[220px] rounded-xl border border-border/30 bg-surface/20 px-3.5 py-2 text-sm text-foreground sm:min-w-[320px]"
                        >
                          {brandProfiles.map((profile) => (
                            <option key={profile.id} value={profile.id}>
                              {profile.name}
                            </option>
                          ))}
                        </select>
                        {activeBrandProfileQuality ? (
                          <Badge
                            className={cn(
                              "text-xs",
                              activeBrandProfileQuality.level === "Strong profile"
                                ? "bg-emerald-500/20 text-emerald-100"
                                : activeBrandProfileQuality.level === "Needs more detail"
                                  ? "bg-amber-500/20 text-amber-100"
                                  : "bg-slate-500/20 text-slate-100"
                            )}
                          >
                            {activeBrandProfileQuality.level}
                          </Badge>
                        ) : null}
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          className="text-xs text-muted transition hover:text-foreground"
                          onClick={handleOpenCreateBrandProfile}
                        >
                          Create
                        </button>
                        <button
                          type="button"
                          className="text-xs text-muted transition hover:text-foreground disabled:opacity-50"
                          onClick={handleOpenEditBrandProfile}
                          disabled={!activeBrandProfile || brandActionLoading}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="text-xs text-muted transition hover:text-foreground disabled:opacity-50"
                          onClick={handleDeleteBrandProfile}
                          disabled={!activeBrandProfile || brandActionLoading}
                        >
                          Delete
                        </button>
                        {activeBrandProfileQuality &&
                        activeBrandProfileQuality.missing.length > 0 ? (
                          <p className="text-xs text-muted">
                            Hint: add {activeBrandProfileQuality.missing.join(", ")}.
                          </p>
                        ) : null}
                      </div>
                    </div>
                  )}
                  {brandProfilesError ? (
                    <p className="text-sm text-red-200">{brandProfilesError}</p>
                  ) : null}
                </section>

                <section className="space-y-3">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-muted/80">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-surface/45 text-[11px] text-foreground">
                      2
                    </span>
                    Content template
                  </div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <select
                      id="template-select"
                      value={selectedTemplateId}
                      onChange={(event) =>
                        setSelectedTemplateId(event.target.value as ContentTemplateId)
                      }
                      className="min-w-[220px] rounded-xl border border-border/30 bg-surface/20 px-3.5 py-2 text-sm text-foreground sm:min-w-[300px]"
                    >
                      {CONTENT_TEMPLATE_OPTIONS.map((template) => (
                        <option key={template.id} value={template.id}>
                          {template.label}
                        </option>
                      ))}
                    </select>
                    <span className="text-xs text-muted">{activeTemplate.summary}</span>
                  </div>
                  <button
                    type="button"
                    className="text-xs text-muted transition hover:text-foreground"
                    onClick={() => setTemplateDetailsOpen((prev) => !prev)}
                  >
                    {templateDetailsOpen ? "Hide details" : "Show details"}
                  </button>
                  {templateDetailsOpen ? (
                    <p className="text-xs text-muted">
                      Affects hooks, CTA framing, structure, and psychology.
                    </p>
                  ) : null}
                </section>

                <section className="space-y-3">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-muted/80">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-surface/45 text-[11px] text-foreground">
                      3
                    </span>
                    Weekly focus
                  </div>
                  <Textarea
                    rows={3}
                    className="rounded-2xl border-border/30 bg-surface/15 shadow-none focus-visible:ring-brand/30"
                    placeholder="Weekend open house campaign for downtown condos"
                    value={input.topic}
                    onChange={handleTextChange("topic")}
                  />
                  <div className="flex flex-wrap gap-2">
                    {onboardingSamples.map((sample) => (
                      <button
                        key={sample.label}
                        type="button"
                        onClick={() => handleLoadSample(sample)}
                        className="rounded-full border border-transparent bg-surface/15 px-3 py-1 text-xs text-muted transition hover:border-border/30 hover:text-foreground"
                      >
                        {sample.label}
                      </button>
                    ))}
                  </div>
                </section>

                <section className="space-y-3">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-muted/80">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-surface/45 text-[11px] text-foreground">
                      4
                    </span>
                    Weekly goal
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {weeklyGoalOptions.map((goal) => (
                      <button
                        key={goal}
                        type="button"
                        onClick={() => setInput((prev) => ({ ...prev, weeklyGoal: goal }))}
                        className={goalPillClass(goal)}
                      >
                        {goal}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <label htmlFor="platform-focus-select" className="text-xs text-muted">
                      Platform focus (optional)
                    </label>
                    <select
                      id="platform-focus-select"
                      value={input.platformFocus?.[0] ?? ""}
                      onChange={handlePlatformFocusChange}
                      className="min-w-[220px] rounded-xl border border-border/30 bg-surface/20 px-3.5 py-2 text-sm text-foreground"
                    >
                      <option value="">Auto-select best platform mix</option>
                      {workflowPlatformOptions.map((platform) => (
                        <option key={platform} value={platform}>
                          {platform}
                        </option>
                      ))}
                    </select>
                  </div>
                </section>

                <section className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setAdvancedOptionsOpen((prev) => !prev)}
                    className="inline-flex items-center gap-2 text-xs text-muted transition hover:text-foreground"
                    aria-expanded={advancedOptionsOpen}
                  >
                    <span className={cn("text-[10px] transition", advancedOptionsOpen ? "rotate-180" : "")}>
                      v
                    </span>
                    {advancedOptionsOpen ? "Hide additional controls" : "Additional controls"}
                  </button>
                  {advancedOptionsOpen ? (
                    <div className="grid gap-4 border-l border-border/20 pl-4 sm:grid-cols-3">
                      <label className="space-y-2 text-xs text-muted">
                        <span>Niche</span>
                        <Input
                          className="rounded-xl border-border/30 bg-surface/20 text-sm shadow-none focus-visible:ring-brand/30"
                          placeholder="Realtor"
                          value={input.niche}
                          onChange={handleTextChange("niche")}
                        />
                      </label>
                      <label className="space-y-2 text-xs text-muted">
                        <span>Audience</span>
                        <Input
                          className="rounded-xl border-border/30 bg-surface/20 text-sm shadow-none focus-visible:ring-brand/30"
                          placeholder="First-time buyers"
                          value={input.audience}
                          onChange={handleTextChange("audience")}
                        />
                      </label>
                      <label className="space-y-2 text-xs text-muted">
                        <span>Tone</span>
                        <Input
                          className="rounded-xl border-border/30 bg-surface/20 text-sm shadow-none focus-visible:ring-brand/30"
                          list="tone-options"
                          placeholder="Confident"
                          value={input.tone}
                          onChange={handleTextChange("tone")}
                        />
                      </label>
                    </div>
                  ) : null}
                </section>

                <datalist id="tone-options">
                  {toneOptions.map((tone) => (
                    <option key={tone} value={tone} />
                  ))}
                </datalist>

                <section className="space-y-3 border-t border-border/20 pt-5">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-muted/80">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-surface/45 text-[11px] text-foreground">
                      5
                    </span>
                    Generate
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button type="submit" size="lg" disabled={!isFormValid || limitReached}>
                      Generate weekly plan
                    </Button>
                    <p className="text-xs text-muted">
                      Generates strategy, sequence, hooks, captions, and CTA variations.
                    </p>
                  </div>
                </section>

                {limitReached ? (
                  <p className="text-sm text-red-200">
                    Free plan limit reached. Upgrade to continue.
                  </p>
                ) : null}
                {error ? <p className="text-sm text-red-200">{error}</p> : null}
              </form>
            )}
          </main>

          <aside className="hidden xl:block">
            <div className="sticky top-4 space-y-4 rounded-2xl border border-border/20 bg-surface/10 p-4">
              <p className="text-[10px] uppercase tracking-[0.22em] text-muted/80">Context</p>
              <div className="space-y-3 text-xs">
                <div className="space-y-0.5">
                  <p className="text-muted">Active brand</p>
                  <p className="break-words text-sm text-foreground">
                    {activeBrandProfile?.name ?? "None selected"}
                  </p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-muted">Profile quality</p>
                  <p className="text-sm text-foreground">
                    {activeBrandProfileQuality?.level ?? "Not available"}
                  </p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-muted">Template</p>
                  <p className="text-sm text-foreground">{activeTemplate.label}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-muted">Weekly goal</p>
                  <p className="text-sm text-foreground">{activeGoalLabel}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-muted">Usage</p>
                  <p className="text-sm text-foreground">{usageSummary}</p>
                  {isFreePlan && resetLabel ? (
                    <p className="text-[11px] text-muted">Resets {resetLabel}</p>
                  ) : null}
                </div>
              </div>

              {historyPreview.length > 0 ? (
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted/70">
                    Recent plans
                  </p>
                  {historyPreview.slice(0, 3).map((item) => (
                    <button
                      key={`context-${item.id}`}
                      type="button"
                      onClick={() => handleSelect(item)}
                      className={cn(
                        "w-full rounded-lg px-2.5 py-2 text-left transition",
                        item.id === activeId
                          ? "bg-surface/45 text-foreground"
                          : "text-muted hover:bg-surface/20 hover:text-foreground"
                      )}
                    >
                      <p className="truncate text-xs">{item.topic}</p>
                    </button>
                  ))}
                  <button
                    type="button"
                    className="pt-1 text-xs text-muted transition hover:text-foreground"
                    onClick={() => openSidebarSection("history")}
                  >
                    Open full history
                  </button>
                </div>
              ) : null}
            </div>
          </aside>
        </div>
      </div>

      <UpgradeModal
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        onUpgrade={handleUpgrade}
        loading={upgradeLoading}
      />
      <BrandProfileModal
        open={brandModalOpen}
        initialProfile={editingBrandProfile}
        onClose={() => {
          if (brandActionLoading) {
            return;
          }
          setBrandModalOpen(false);
          setEditingBrandProfile(null);
        }}
        onSave={handleSaveBrandProfile}
      />
      <OnboardingModal
        open={onboardingOpen}
        samples={onboardingSamples}
        onClose={handleOnboardingClose}
        onLoadSample={handleLoadSample}
      />
    </>
  );
}



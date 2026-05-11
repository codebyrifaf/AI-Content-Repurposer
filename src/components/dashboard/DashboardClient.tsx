"use client";

import {
  useMemo,
  useState,
  useEffect,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { BrandProfileModal } from "@/components/brand/BrandProfileModal";
import { Card } from "@/components/ui/Card";
import { CopyButton } from "@/components/ui/CopyButton";
import { UpgradeModal } from "@/components/billing/UpgradeModal";
import {
  OnboardingModal,
  type OnboardingSample,
} from "@/components/dashboard/OnboardingModal";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/Toast";
import { CONTENT_TEMPLATE_OPTIONS } from "@/lib/prompts/templates";
import { cn } from "@/lib/utils";
import { getBrandProfileQuality } from "@/lib/brand-profiles/quality";
import type { BrandProfile, BrandProfileInput } from "@/types/brand-profile";
import type {
  ContentTemplateId,
  ContentPackOutput,
  GenerationInput,
  GenerationOutput,
  GenerationRecord,
  GenerationResponse,
  WeeklyGoal,
} from "@/types/generation";
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

type Platform =
  | "Strategy"
  | "Carousel"
  | "Instagram"
  | "Reel"
  | "Pinterest"
  | "Planner"
  | "CTA"
  | "Engagement"
  | "Variations"
  | "Legacy";

const platformStyles: Record<Platform, string> = {
  Strategy: "border-brand/50 bg-brand/15 text-foreground",
  Carousel: "border-orange-400/40 bg-orange-500/10 text-orange-100",
  Instagram: "border-orange-400/40 bg-orange-500/10 text-orange-100",
  Reel: "border-amber-400/40 bg-amber-500/10 text-amber-100",
  Pinterest: "border-pink-400/40 bg-pink-500/10 text-pink-100",
  Planner: "border-emerald-400/40 bg-emerald-500/10 text-emerald-100",
  CTA: "border-sky-400/40 bg-sky-500/10 text-sky-100",
  Engagement: "border-slate-400/40 bg-slate-500/10 text-slate-100",
  Variations: "border-violet-400/40 bg-violet-500/10 text-violet-100",
  Legacy: "border-slate-400/40 bg-slate-500/10 text-slate-100",
};

function PlatformBadge({ platform }: { platform: Platform }) {
  return (
    <Badge className={cn("border", platformStyles[platform])}>{platform}</Badge>
  );
}

type ResultCardProps = {
  title: string;
  platform?: Platform;
  copyText?: string;
  children: ReactNode;
  className?: string;
};

function ResultCard({
  title,
  platform,
  copyText,
  children,
  className,
}: ResultCardProps) {
  return (
    <Card className={cn("flex h-full flex-col gap-4", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {platform ? <PlatformBadge platform={platform} /> : null}
          <p className="text-xs uppercase tracking-[0.3em] text-muted">
            {title}
          </p>
        </div>
        {copyText ? <CopyButton text={copyText} /> : null}
      </div>
      {children}
    </Card>
  );
}

function renderParagraphs(text: string) {
  return text
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph, index) => (
      <p key={`${index}-${paragraph}`} className="text-sm text-foreground">
        {paragraph}
      </p>
    ));
}

type CollapsibleCardProps = ResultCardProps & {
  defaultOpen?: boolean;
};

function CollapsibleCard({
  title,
  platform,
  copyText,
  children,
  className,
  defaultOpen = false,
}: CollapsibleCardProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Card className={cn("flex h-full flex-col gap-4", className)}>
      <div className="flex items-start justify-between gap-3">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="flex flex-wrap items-center gap-2 text-left"
          aria-expanded={open}
        >
          {platform ? <PlatformBadge platform={platform} /> : null}
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted">
              {title}
            </p>
            <p className="text-xs text-muted">{open ? "Hide" : "Show"}</p>
          </div>
        </button>
        {copyText ? <CopyButton text={copyText} /> : null}
      </div>
      {open ? <div className="space-y-3">{children}</div> : null}
    </Card>
  );
}

type PackTab =
  | "Overview"
  | "Instagram"
  | "Reel"
  | "Pinterest"
  | "Planner"
  | "CTA"
  | "Variations";

const packTabs: PackTab[] = [
  "Overview",
  "Instagram",
  "Reel",
  "Pinterest",
  "Planner",
  "CTA",
  "Variations",
];

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

export type DashboardClientProps = {
  initialHistory: GenerationRecord[];
  initialUsage: UsageSnapshot;
};

export function DashboardClient({
  initialHistory,
  initialUsage,
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
            extractWorkflowGoal(initialItem.result) ??
            initialInput.weeklyGoal,
          platformFocus: extractWorkflowPlatformFocus(initialItem.result),
        }
      : initialInput
  );
  const [result, setResult] = useState<GenerationOutput | null>(
    initialItem?.result ?? null
  );
  const [history, setHistory] = useState<GenerationRecord[]>(initialHistory);
  const [activeId, setActiveId] = useState<string | null>(
    initialItem?.id ?? null
  );
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
  const [activeBrandProfileId, setActiveBrandProfileId] = useState<string | null>(
    null
  );
  const [selectedTemplateId, setSelectedTemplateId] =
    useState<ContentTemplateId>(defaultTemplateId);
  const [loading, setLoading] = useState(false);
  const [loadingStageIndex, setLoadingStageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<PackTab>("Overview");
  const dateFormatter = useMemo(
    () => new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }),
    []
  );
  const isFreePlan = usage.subscriptionStatus === "free";
  const remaining = usage.remaining;
  const limitReached = isFreePlan && remaining !== null && remaining <= 0;
  const lowCredits = isFreePlan && remaining !== null && remaining <= 1;
  const resetLabel = isFreePlan
    ? dateFormatter.format(new Date(usage.monthlyResetDate))
    : null;
  const activeBrandProfile = useMemo(
    () =>
      brandProfiles.find((profile) => profile.id === activeBrandProfileId) ?? null,
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
    if (result && isContentPackOutput(result)) {
      setActiveTab("Overview");
    }
  }, [result]);

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

  const isFormValid = useMemo(
    () => {
      const hasRequiredFields =
        input.niche.trim().length > 0 &&
        input.audience.trim().length > 0 &&
        input.topic.trim().length > 0 &&
        input.tone.trim().length > 0;
      const hasWeeklyGoal =
        typeof input.weeklyGoal === "string" &&
        input.weeklyGoal.trim().length > 0;
      return hasRequiredFields && hasWeeklyGoal && !loading;
    },
    [input, loading]
  );

  const handleTextChange =
    (field: "niche" | "audience" | "topic" | "tone" | "weeklyGoal") =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setInput((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handlePlatformFocusChange = (
    event: ChangeEvent<HTMLSelectElement>
  ) => {
    const value = event.target.value.trim();
    setInput((prev) => ({
      ...prev,
      platformFocus: value ? [value] : [],
    }));
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
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...input,
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
        const message = payload.success
          ? "Generation failed."
          : payload.error;
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
        /failed to fetch|networkerror/i.test(message)
          ? "AI is temporarily unavailable. Please try again in a moment."
          : message;
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
        extractWorkflowGoal(item.result) ??
        prev.weeklyGoal ??
        "increase engagement",
      platformFocus: extractWorkflowPlatformFocus(item.result),
    }));
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
      platformFocus: prev.platformFocus ?? [],
    }));
    setResult(null);
    setActiveId(null);
    handleOnboardingClose();
    pushToast({
      title: "Sample loaded",
      description: "Review the inputs and generate when ready.",
      tone: "info",
    });
  };

  const handleOpenCreateBrandProfile = () => {
    setEditingBrandProfile(null);
    setBrandModalOpen(true);
  };

  const handleOpenEditBrandProfile = () => {
    if (!activeBrandProfile) {
      return;
    }
    setEditingBrandProfile(activeBrandProfile);
    setBrandModalOpen(true);
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

      const result = (await response.json()) as BrandProfileResponse;
      if (!response.ok || !result.data) {
        throw new Error(result.error ?? "Unable to save brand profile.");
      }

      const savedProfile = result.data;
      setBrandProfiles((prev) => {
        const withoutSaved = prev.filter((profile) => profile.id !== savedProfile.id);
        return [savedProfile, ...withoutSaved];
      });
      setActiveBrandProfileId(savedProfile.id);
      setEditingBrandProfile(null);
      pushToast({
        title: isEdit ? "Profile updated" : "Profile created",
        description: `${savedProfile.name} is now available for generation.`,
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

  const renderCarouselSlides = (pack: ContentPackOutput) => (
    <ol className="space-y-2 text-sm text-foreground">
      {pack.carousel.slides.map((slide, index) => (
        <li
          key={`${index}-${slide}`}
          className="rounded-lg bg-surface-2/60 p-2"
        >
          <span className="text-xs uppercase tracking-[0.2em] text-muted">
            Slide {index + 1}
          </span>
          <p className="mt-2 text-sm text-foreground">{slide}</p>
        </li>
      ))}
    </ol>
  );

  const renderWeeklyPlan = (pack: ContentPackOutput) => (
    <div className="grid gap-3 sm:grid-cols-2">
      {pack.weeklyPlan.map((day) => (
        <div
          key={`${day.day}-${day.platform}`}
          className="rounded-xl border border-border/60 bg-surface-2/60 p-3 text-sm"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-muted">
            {day.day}
          </p>
          <p className="mt-2 text-foreground">
            {day.platform} - {day.postType}
          </p>
          <p className="mt-1 text-xs text-muted">Goal: {day.goal}</p>
          <p className="mt-1 text-xs text-muted">
            Engagement: {day.engagementFocus}
          </p>
        </div>
      ))}
    </div>
  );

  const renderPinterestPins = (pack: ContentPackOutput) => (
    <div className="grid gap-3">
      {pack.pinterestPins.map((pin, index) => (
        <div
          key={`${index}-${pin.title}`}
          className="rounded-xl border border-border/60 bg-surface-2/60 p-3"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-muted">
            Pin {index + 1}
          </p>
          <p className="mt-2 text-sm text-foreground">{pin.title}</p>
          <p className="mt-2 text-xs text-muted">{pin.description}</p>
          <p className="mt-2 text-xs text-muted">Visual: {pin.visualIdea}</p>
        </div>
      ))}
    </div>
  );

  const renderCaptionVariations = (pack: ContentPackOutput) => (
    <div className="space-y-3">
      {pack.captionVariations.map((item, index) => (
        <div
          key={`${index}-${item.style}`}
          className="rounded-xl border border-border/60 bg-surface-2/60 p-3"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-muted">
            {item.style}
          </p>
          <div className="mt-2 space-y-2">
            {renderParagraphs(item.caption)}
          </div>
        </div>
      ))}
    </div>
  );

  const renderHookVariations = (pack: ContentPackOutput) => (
    <ul className="space-y-2 text-sm text-foreground">
      {pack.hookVariations.map((item, index) => (
        <li
          key={`${index}-${item.format}`}
          className="rounded-lg bg-surface-2/60 p-2"
        >
          <span className="text-xs uppercase tracking-[0.2em] text-muted">
            {item.format}
          </span>
          <p className="mt-2 text-sm text-foreground">{item.hook}</p>
        </li>
      ))}
    </ul>
  );

  const buildWeeklyWorkflowCopyText = (pack: ContentPackOutput) => {
    if (!pack.weeklyWorkflow) {
      return undefined;
    }

    return [
      pack.weeklyWorkflow.strategySummary,
      `Theme: ${pack.weeklyWorkflow.contentTheme}`,
      pack.weeklyWorkflow.audienceAngle
        ? `Audience angle: ${pack.weeklyWorkflow.audienceAngle}`
        : null,
      pack.weeklyWorkflow.platformFocus?.length
        ? `Platform focus: ${pack.weeklyWorkflow.platformFocus.join(", ")}`
        : null,
      ...pack.weeklyWorkflow.postingSequence.map(
        (step, index) => `${index + 1}. ${step}`
      ),
      ...(pack.weeklyWorkflow.recommendedContentOrder?.map(
        (item, index) => `Order ${index + 1}: ${item}`
      ) ?? []),
      pack.weeklyWorkflow.carouselConcept
        ? `Carousel concept: ${pack.weeklyWorkflow.carouselConcept}`
        : null,
      pack.weeklyWorkflow.reelConcept
        ? `Reel concept: ${pack.weeklyWorkflow.reelConcept}`
        : null,
      pack.weeklyWorkflow.repurposeIdea
        ? `Repurpose: ${pack.weeklyWorkflow.repurposeIdea}`
        : null,
    ]
      .filter(Boolean)
      .join("\n");
  };

  const renderWeeklyWorkflowSummary = (pack: ContentPackOutput) => {
    if (!pack.weeklyWorkflow) {
      return null;
    }

    return (
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-border/60 bg-surface-2/60 p-3">
          <p className="text-xs uppercase tracking-[0.3em] text-muted">
            Weekly strategy summary
          </p>
          <p className="mt-2 text-sm text-foreground">
            {pack.weeklyWorkflow.strategySummary}
          </p>
        </div>
        <div className="rounded-xl border border-border/60 bg-surface-2/60 p-3">
          <p className="text-xs uppercase tracking-[0.3em] text-muted">
            Content theme
          </p>
          <p className="mt-2 text-sm text-foreground">
            {pack.weeklyWorkflow.contentTheme}
          </p>
        </div>
        {pack.weeklyWorkflow.audienceAngle ? (
          <div className="rounded-xl border border-border/60 bg-surface-2/60 p-3">
            <p className="text-xs uppercase tracking-[0.3em] text-muted">
              Audience angle
            </p>
            <p className="mt-2 text-sm text-foreground">
              {pack.weeklyWorkflow.audienceAngle}
            </p>
          </div>
        ) : null}
        {pack.weeklyWorkflow.platformFocus &&
        pack.weeklyWorkflow.platformFocus.length > 0 ? (
          <div className="rounded-xl border border-border/60 bg-surface-2/60 p-3">
            <p className="text-xs uppercase tracking-[0.3em] text-muted">
              Platform focus
            </p>
            <p className="mt-2 text-sm text-foreground">
              {pack.weeklyWorkflow.platformFocus.join(", ")}
            </p>
          </div>
        ) : null}
        <div className="rounded-xl border border-border/60 bg-surface-2/60 p-3 sm:col-span-2">
          <p className="text-xs uppercase tracking-[0.3em] text-muted">
            Recommended posting sequence
          </p>
          <ol className="mt-2 space-y-2 text-sm text-foreground">
            {pack.weeklyWorkflow.postingSequence.map((step, index) => (
              <li key={`${index}-${step}`}>{index + 1}. {step}</li>
            ))}
          </ol>
          {pack.weeklyWorkflow.repurposeIdea ? (
            <p className="mt-3 text-xs text-muted">
              Repurpose idea: {pack.weeklyWorkflow.repurposeIdea}
            </p>
          ) : null}
          {pack.weeklyWorkflow.recommendedContentOrder &&
          pack.weeklyWorkflow.recommendedContentOrder.length > 0 ? (
            <div className="mt-3 rounded-lg border border-border/60 bg-surface/60 p-3">
              <p className="text-xs uppercase tracking-[0.2em] text-muted">
                Recommended content order
              </p>
              <ol className="mt-2 space-y-1 text-sm text-foreground">
                {pack.weeklyWorkflow.recommendedContentOrder.map((item, index) => (
                  <li key={`${index}-${item}`}>{index + 1}. {item}</li>
                ))}
              </ol>
            </div>
          ) : null}
          {(pack.weeklyWorkflow.carouselConcept || pack.weeklyWorkflow.reelConcept) ? (
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {pack.weeklyWorkflow.carouselConcept ? (
                <div className="rounded-lg border border-border/60 bg-surface/60 p-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted">
                    Carousel concept
                  </p>
                  <p className="mt-1 text-sm text-foreground">
                    {pack.weeklyWorkflow.carouselConcept}
                  </p>
                </div>
              ) : null}
              {pack.weeklyWorkflow.reelConcept ? (
                <div className="rounded-lg border border-border/60 bg-surface/60 p-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted">
                    Reel concept
                  </p>
                  <p className="mt-1 text-sm text-foreground">
                    {pack.weeklyWorkflow.reelConcept}
                  </p>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    );
  };

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-10 lg:grid-cols-[360px_1fr]">
      <Card className="h-fit">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-2xl border border-border/60 bg-surface-2/70 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <p className="text-xs uppercase tracking-[0.3em] text-muted">
                  Plan
                </p>
                <Badge className={isFreePlan ? "bg-surface/80" : "bg-brand/20 text-foreground"}>
                  {isFreePlan ? "Free" : "Pro"}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setOnboardingOpen(true)}
                >
                  Guide
                </Button>
                {isFreePlan ? (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setUpgradeOpen(true)}
                  >
                    Upgrade
                  </Button>
                ) : (
                  <Badge className="bg-brand/20 text-foreground">Unlimited</Badge>
                )}
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="font-display text-3xl text-foreground">
                  {isFreePlan ? remaining ?? 0 : "Unlimited"}
                </p>
                <p className="text-xs text-muted">Generations remaining</p>
              </div>
              {resetLabel ? (
                <p className="text-xs text-muted">Resets {resetLabel}</p>
              ) : null}
            </div>
            {lowCredits ? (
              <div className="mt-3 rounded-xl border border-amber-400/40 bg-amber-500/10 p-3 text-xs text-amber-100">
                You are running low on free generations. Upgrade to keep
                publishing without interruptions.
              </div>
            ) : null}
            {limitReached ? (
              <div className="mt-3 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-100">
                Free plan limit reached. Upgrade to unlock unlimited
                generations.
              </div>
            ) : null}
          </div>
          <div className="rounded-2xl border border-border/60 bg-surface-2/70 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <p className="text-xs uppercase tracking-[0.3em] text-muted">
                  Brand profile
                </p>
                {activeBrandProfile ? (
                  <Badge className="bg-brand/20 text-foreground">Active</Badge>
                ) : null}
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
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={handleOpenCreateBrandProfile}
                >
                  New
                </Button>
                {activeBrandProfile ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={handleOpenEditBrandProfile}
                    disabled={brandActionLoading}
                  >
                    Edit
                  </Button>
                ) : null}
                {activeBrandProfile ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={handleDeleteBrandProfile}
                    disabled={brandActionLoading}
                  >
                    Delete
                  </Button>
                ) : null}
              </div>
            </div>

            {brandProfilesLoading ? (
              <div className="mt-3 space-y-2">
                <Skeleton className="h-10" />
                <Skeleton className="h-20" />
              </div>
            ) : brandProfilesError ? (
              <div className="mt-3 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-200">
                {brandProfilesError}
              </div>
            ) : brandProfiles.length === 0 ? (
              <div className="mt-3 space-y-3 rounded-xl border border-border/60 bg-surface/70 p-3">
                <p className="text-sm text-foreground">
                  Create a brand profile to make outputs sound like your business.
                </p>
                <p className="text-xs text-muted">
                  Add offer, audience, CTA style, and forbidden phrases for stronger personalization.
                </p>
                <p className="text-xs text-muted">
                  Example: coach + &quot;Book a strategy call&quot; CTA, realtor +
                  &quot;Schedule a private tour&quot; CTA.
                </p>
                <p className="text-xs text-muted">
                  Starter profile: description &quot;Local growth consultant&quot;, audience
                  &quot;overworked owners&quot;, offer &quot;free funnel audit&quot;.
                </p>
                <label className="space-y-2 text-sm text-muted">
                  <span>Content template</span>
                  <select
                    value={selectedTemplateId}
                    onChange={(event) =>
                      setSelectedTemplateId(event.target.value as ContentTemplateId)
                    }
                    className="w-full rounded-xl border border-border/60 bg-surface px-4 py-3 text-sm text-foreground"
                  >
                    {CONTENT_TEMPLATE_OPTIONS.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.label}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="rounded-xl border border-border/60 bg-surface/70 p-3 text-xs text-muted">
                  <p className="text-sm text-foreground">{activeTemplate.label}</p>
                  <p className="mt-1">{activeTemplate.summary}</p>
                  <p className="mt-2">
                    Affects: {activeTemplate.affects.join(", ")}.
                  </p>
                </div>
                <Button type="button" size="sm" onClick={handleOpenCreateBrandProfile}>
                  Create first brand profile
                </Button>
              </div>
            ) : (
              <div className="mt-3 space-y-3">
                <label className="space-y-2 text-sm text-muted">
                  <span>Active brand profile</span>
                  <select
                    value={activeBrandProfileId ?? ""}
                    onChange={(event) =>
                      setActiveBrandProfileId(event.target.value || null)
                    }
                    className="w-full rounded-xl border border-border/60 bg-surface px-4 py-3 text-sm text-foreground"
                  >
                    {brandProfiles.map((profile) => (
                      <option key={profile.id} value={profile.id}>
                        {profile.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2 text-sm text-muted">
                  <span>Content template</span>
                  <select
                    value={selectedTemplateId}
                    onChange={(event) =>
                      setSelectedTemplateId(event.target.value as ContentTemplateId)
                    }
                    className="w-full rounded-xl border border-border/60 bg-surface px-4 py-3 text-sm text-foreground"
                  >
                    {CONTENT_TEMPLATE_OPTIONS.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.label}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="rounded-xl border border-border/60 bg-surface/70 p-3 text-xs text-muted">
                  <p className="text-sm text-foreground">{activeTemplate.label}</p>
                  <p className="mt-1">{activeTemplate.summary}</p>
                  <p className="mt-2">
                    Affects: {activeTemplate.affects.join(", ")}.
                  </p>
                  <p className="mt-2">
                    Templates shape hook style, CTA pressure, content flow, and weekly psychology.
                  </p>
                </div>
                {activeBrandProfile ? (
                  <div className="grid gap-2 rounded-xl border border-border/60 bg-surface/70 p-3 text-xs text-muted">
                    <p>
                      <span className="text-foreground">Tone:</span>{" "}
                      {activeBrandProfile.toneOfVoice ?? input.tone}
                    </p>
                    <p>
                      <span className="text-foreground">Audience:</span>{" "}
                      {activeBrandProfile.targetAudience ?? input.audience}
                    </p>
                    <p>
                      <span className="text-foreground">CTA style:</span>{" "}
                      {activeBrandProfile.ctaStyle ?? "Not set"}
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <Badge className="bg-surface-2 text-foreground">
                        {activeBrandProfile.brandKeywords.length} keywords
                      </Badge>
                      <Badge className="bg-surface-2 text-foreground">
                        {activeBrandProfile.forbiddenPhrases.length} forbidden
                      </Badge>
                    </div>
                    {activeBrandProfileQuality &&
                    activeBrandProfileQuality.missing.length > 0 ? (
                      <p className="text-xs text-amber-100">
                        Needs more detail: add {activeBrandProfileQuality.missing.join(", ")}.
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            )}
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted">
              Weekly workflow
            </p>
            <h2 className="mt-2 font-display text-2xl text-foreground">
              Plan your marketing week
            </h2>
            <p className="mt-2 text-sm text-muted">
              Structured inputs create a connected weekly campaign, not random post ideas.
            </p>
          </div>

          <div className="space-y-4">
            <label className="space-y-2 text-sm text-muted">
              <span>Step 1 - Niche</span>
              <Input
                placeholder="Creator wellness"
                value={input.niche}
                onChange={handleTextChange("niche")}
              />
            </label>
            <label className="space-y-2 text-sm text-muted">
              <span>Step 2 - Target audience</span>
              <Input
                placeholder="Busy solo creators"
                value={input.audience}
                onChange={handleTextChange("audience")}
              />
            </label>
            <label className="space-y-2 text-sm text-muted">
              <span>Step 3 - Weekly focus / campaign topic</span>
              <Textarea
                placeholder="Daily routines for mental clarity"
                value={input.topic}
                onChange={handleTextChange("topic")}
              />
              <p className="text-xs text-muted">
                Why this matters: one clear weekly focus improves narrative consistency across all posts.
              </p>
            </label>
            <label className="space-y-2 text-sm text-muted">
              <span>Step 4 - Tone</span>
              <Input
                list="tone-options"
                placeholder="Confident"
                value={input.tone}
                onChange={handleTextChange("tone")}
              />
            </label>
            <label className="space-y-2 text-sm text-muted">
              <span>Step 5 - Weekly posting goal</span>
              <select
                value={input.weeklyGoal ?? "increase engagement"}
                onChange={(event) =>
                  setInput((prev) => ({ ...prev, weeklyGoal: event.target.value }))
                }
                className="w-full rounded-xl border border-border/60 bg-surface px-4 py-3 text-sm text-foreground"
              >
                {weeklyGoalOptions.map((goal) => (
                  <option key={goal} value={goal}>
                    {goal}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-sm text-muted">
              <span>Step 6 - Platform focus (optional)</span>
              <select
                value={input.platformFocus?.[0] ?? ""}
                onChange={handlePlatformFocusChange}
                className="w-full rounded-xl border border-border/60 bg-surface px-4 py-3 text-sm text-foreground"
              >
                <option value="">Auto-select best platform mix</option>
                {workflowPlatformOptions.map((platform) => (
                  <option key={platform} value={platform}>
                    {platform}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted">
                Platform focus fine-tunes hook structure and CTA style per channel.
              </p>
            </label>
            <datalist id="tone-options">
              {toneOptions.map((tone) => (
                <option key={tone} value={tone} />
              ))}
            </datalist>
          </div>

          <Button type="submit" size="lg" disabled={!isFormValid || limitReached}>
            {loading ? "Generating content pack..." : "Generate weekly content pack"}
          </Button>
          {loadingStage ? (
            <p className="text-xs text-muted">{loadingStage}</p>
          ) : null}

          {error ? (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">
              <p>{error}</p>
              {isAiUnavailableError ? (
                <p className="mt-2 text-xs text-red-100">
                  Try again in a moment. Your workflow inputs are still saved here.
                </p>
              ) : null}
            </div>
          ) : null}
        </form>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1fr_280px]">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted">
                Output
              </p>
              <h2 className="mt-2 font-display text-2xl text-foreground">
                Generated content
              </h2>
              <p className="mt-2 text-xs text-muted">
                Active profile: {activeBrandProfile?.name ?? "None"} | Template:{" "}
                {activeTemplate.label} | Goal:{" "}
                {typeof input.weeklyGoal === "string" && input.weeklyGoal.trim().length > 0
                  ? input.weeklyGoal
                  : "increase engagement"}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {loading ? (
                <Badge className="bg-surface-2 text-foreground">
                  {loadingStage ?? "Generating..."}
                </Badge>
              ) : null}
              {result ? (
                <Badge className="bg-brand/20 text-foreground">Live</Badge>
              ) : null}
              {result ? (
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
                </div>
              ) : null}
            </div>
          </div>

          {loading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-40" />
              ))}
            </div>
          ) : result && isContentPackOutput(result) ? (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {packTabs.map((tab) => (
                  <Button
                    key={tab}
                    size="sm"
                    variant={tab === activeTab ? "secondary" : "ghost"}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </Button>
                ))}
              </div>

              {activeTab === "Overview" ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <CollapsibleCard
                    title="Weekly workflow summary"
                    platform="Planner"
                    className="md:col-span-2"
                    defaultOpen
                    copyText={buildWeeklyWorkflowCopyText(result)}
                  >
                    {result.weeklyWorkflow ? (
                      renderWeeklyWorkflowSummary(result)
                    ) : (
                      <p className="text-sm text-muted">
                        No weekly strategy summary yet. Generate again to refresh a guided weekly workflow summary.
                      </p>
                    )}
                  </CollapsibleCard>

                  <CollapsibleCard
                    title="Strategy snapshot"
                    platform="Strategy"
                    className="md:col-span-2"
                    defaultOpen
                    copyText={`${result.strategy.postingAngle}\n${result.strategy.painPoint}\n${result.strategy.engagementStrategy}`}
                  >
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="space-y-2 rounded-xl border border-border/60 bg-surface-2/60 p-3">
                        <p className="text-xs uppercase tracking-[0.3em] text-muted">
                          Posting angle
                        </p>
                        <p className="text-sm text-foreground">
                          {result.strategy.postingAngle}
                        </p>
                      </div>
                      <div className="space-y-2 rounded-xl border border-border/60 bg-surface-2/60 p-3">
                        <p className="text-xs uppercase tracking-[0.3em] text-muted">
                          Audience pain point
                        </p>
                        <p className="text-sm text-foreground">
                          {result.strategy.painPoint}
                        </p>
                      </div>
                      <div className="space-y-2 rounded-xl border border-border/60 bg-surface-2/60 p-3">
                        <p className="text-xs uppercase tracking-[0.3em] text-muted">
                          Engagement strategy
                        </p>
                        <p className="text-sm text-foreground">
                          {result.strategy.engagementStrategy}
                        </p>
                      </div>
                    </div>
                  </CollapsibleCard>

                  <CollapsibleCard
                    title="Instagram carousel"
                    platform="Carousel"
                    defaultOpen
                    copyText={[result.carousel.title, ...result.carousel.slides].join("\n")}
                  >
                    <div>
                      <p className="text-sm text-muted">{result.carousel.title}</p>
                    </div>
                    {renderCarouselSlides(result)}
                  </CollapsibleCard>

                  <CollapsibleCard
                    title="Reel script"
                    platform="Reel"
                    copyText={[
                      result.reelScript.hook,
                      ...result.reelScript.talkingPoints,
                      result.reelScript.cta,
                    ].join("\n")}
                  >
                    <p className="text-base font-semibold text-foreground">
                      {result.reelScript.hook}
                    </p>
                    <ul className="space-y-2 text-sm text-foreground">
                      {result.reelScript.talkingPoints.map((point, index) => (
                        <li key={`${index}-${point}`}>{point}</li>
                      ))}
                    </ul>
                    <p className="text-sm text-muted">CTA: {result.reelScript.cta}</p>
                  </CollapsibleCard>

                  <CollapsibleCard
                    title="Weekly plan"
                    platform="Planner"
                    className="md:col-span-2"
                    copyText={result.weeklyPlan
                      .map(
                        (day) =>
                          `${day.day}: ${day.platform} - ${day.postType}. Goal: ${day.goal}. Engagement: ${day.engagementFocus}.`
                      )
                      .join("\n")}
                  >
                    {renderWeeklyPlan(result)}
                  </CollapsibleCard>

                  <CollapsibleCard
                    title="CTA variations"
                    platform="CTA"
                    copyText={`Soft: ${result.ctaVariations.soft}\nAggressive: ${result.ctaVariations.aggressive}\nCuriosity: ${result.ctaVariations.curiosity}\nLead magnet: ${result.ctaVariations.leadMagnet}`}
                  >
                    <div className="space-y-2 text-sm text-foreground">
                      <p>Soft: {result.ctaVariations.soft}</p>
                      <p>Aggressive: {result.ctaVariations.aggressive}</p>
                      <p>Curiosity: {result.ctaVariations.curiosity}</p>
                      <p>Lead magnet: {result.ctaVariations.leadMagnet}</p>
                    </div>
                  </CollapsibleCard>

                  <CollapsibleCard
                    title="Engagement prompts"
                    platform="Engagement"
                    copyText={result.engagementPrompts.join("\n")}
                  >
                    <ul className="space-y-2 text-sm text-foreground">
                      {result.engagementPrompts.map((prompt, index) => (
                        <li key={`${index}-${prompt}`}>{prompt}</li>
                      ))}
                    </ul>
                  </CollapsibleCard>
                </div>
              ) : null}

              {activeTab === "Instagram" ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <CollapsibleCard
                    title="Instagram carousel"
                    platform="Carousel"
                    defaultOpen
                    copyText={[result.carousel.title, ...result.carousel.slides].join("\n")}
                  >
                    <div>
                      <p className="text-sm text-muted">{result.carousel.title}</p>
                    </div>
                    {renderCarouselSlides(result)}
                  </CollapsibleCard>
                  <CollapsibleCard
                    title="Caption variations"
                    platform="Variations"
                    copyText={result.captionVariations
                      .map((item) => `${item.style}: ${item.caption}`)
                      .join("\n\n")}
                  >
                    {renderCaptionVariations(result)}
                  </CollapsibleCard>
                </div>
              ) : null}

              {activeTab === "Reel" ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <CollapsibleCard
                    title="Reel script"
                    platform="Reel"
                    defaultOpen
                    copyText={[
                      result.reelScript.hook,
                      ...result.reelScript.talkingPoints,
                      result.reelScript.cta,
                    ].join("\n")}
                  >
                    <p className="text-base font-semibold text-foreground">
                      {result.reelScript.hook}
                    </p>
                    <ul className="space-y-2 text-sm text-foreground">
                      {result.reelScript.talkingPoints.map((point, index) => (
                        <li key={`${index}-${point}`}>{point}</li>
                      ))}
                    </ul>
                    <p className="text-sm text-muted">CTA: {result.reelScript.cta}</p>
                  </CollapsibleCard>
                  <CollapsibleCard
                    title="Hook variations"
                    platform="Variations"
                    copyText={result.hookVariations
                      .map((item) => `${item.format}: ${item.hook}`)
                      .join("\n")}
                  >
                    {renderHookVariations(result)}
                  </CollapsibleCard>
                </div>
              ) : null}

              {activeTab === "Pinterest" ? (
                <div className="grid gap-4">
                  <CollapsibleCard
                    title="Pinterest pin pack"
                    platform="Pinterest"
                    defaultOpen
                    copyText={result.pinterestPins
                      .map(
                        (pin, index) =>
                          `Pin ${index + 1}: ${pin.title}\n${pin.description}\n${pin.visualIdea}`
                      )
                      .join("\n\n")}
                  >
                    {renderPinterestPins(result)}
                  </CollapsibleCard>
                </div>
              ) : null}

              {activeTab === "Planner" ? (
                <div className="grid gap-4">
                  <CollapsibleCard
                    title="Weekly workflow summary"
                    platform="Planner"
                    defaultOpen
                    copyText={buildWeeklyWorkflowCopyText(result)}
                  >
                    {result.weeklyWorkflow ? (
                      renderWeeklyWorkflowSummary(result)
                    ) : (
                      <p className="text-sm text-muted">
                        No weekly strategy summary yet for this output.
                      </p>
                    )}
                  </CollapsibleCard>
                  <CollapsibleCard
                    title="Weekly plan"
                    platform="Planner"
                    defaultOpen
                    copyText={result.weeklyPlan
                      .map(
                        (day) =>
                          `${day.day}: ${day.platform} - ${day.postType}. Goal: ${day.goal}. Engagement: ${day.engagementFocus}.`
                      )
                      .join("\n")}
                  >
                    {renderWeeklyPlan(result)}
                  </CollapsibleCard>
                </div>
              ) : null}

              {activeTab === "CTA" ? (
                <div className="grid gap-4">
                  <CollapsibleCard
                    title="CTA variations"
                    platform="CTA"
                    defaultOpen
                    copyText={`Soft: ${result.ctaVariations.soft}\nAggressive: ${result.ctaVariations.aggressive}\nCuriosity: ${result.ctaVariations.curiosity}\nLead magnet: ${result.ctaVariations.leadMagnet}`}
                  >
                    <div className="space-y-2 text-sm text-foreground">
                      <p>Soft: {result.ctaVariations.soft}</p>
                      <p>Aggressive: {result.ctaVariations.aggressive}</p>
                      <p>Curiosity: {result.ctaVariations.curiosity}</p>
                      <p>Lead magnet: {result.ctaVariations.leadMagnet}</p>
                    </div>
                  </CollapsibleCard>
                </div>
              ) : null}

              {activeTab === "Variations" ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <CollapsibleCard
                    title="Caption variations"
                    platform="Variations"
                    defaultOpen
                    copyText={result.captionVariations
                      .map((item) => `${item.style}: ${item.caption}`)
                      .join("\n\n")}
                  >
                    {renderCaptionVariations(result)}
                  </CollapsibleCard>
                  <CollapsibleCard
                    title="Hook variations"
                    platform="Variations"
                    copyText={result.hookVariations
                      .map((item) => `${item.format}: ${item.hook}`)
                      .join("\n")}
                  >
                    {renderHookVariations(result)}
                  </CollapsibleCard>
                  <CollapsibleCard
                    title="Engagement prompts"
                    platform="Engagement"
                    copyText={result.engagementPrompts.join("\n")}
                  >
                    <ul className="space-y-2 text-sm text-foreground">
                      {result.engagementPrompts.map((prompt, index) => (
                        <li key={`${index}-${prompt}`}>{prompt}</li>
                      ))}
                    </ul>
                  </CollapsibleCard>
                </div>
              ) : null}
            </div>
          ) : result && isLegacyGenerationOutput(result) ? (
            <div className="space-y-3">
              <Card className="border border-border/60 bg-surface-2/60 p-4 text-sm text-muted">
                Legacy output format detected. New content packs are available for fresh generations.
              </Card>
              <div className="grid gap-4 md:grid-cols-2">
                <ResultCard
                  title="Strategy snapshot"
                  platform="Legacy"
                  className="md:col-span-2"
                  copyText={`${result.postingAngle}\n${result.painPoint}\n${result.engagementStrategy}`}
                >
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2 rounded-xl border border-border/60 bg-surface-2/60 p-3">
                      <p className="text-xs uppercase tracking-[0.3em] text-muted">
                        Posting angle
                      </p>
                      <p className="text-sm text-foreground">
                        {result.postingAngle}
                      </p>
                    </div>
                    <div className="space-y-2 rounded-xl border border-border/60 bg-surface-2/60 p-3">
                      <p className="text-xs uppercase tracking-[0.3em] text-muted">
                        Audience pain point
                      </p>
                      <p className="text-sm text-foreground">{result.painPoint}</p>
                    </div>
                    <div className="space-y-2 rounded-xl border border-border/60 bg-surface-2/60 p-3">
                      <p className="text-xs uppercase tracking-[0.3em] text-muted">
                        Engagement strategy
                      </p>
                      <p className="text-sm text-foreground">
                        {result.engagementStrategy}
                      </p>
                    </div>
                  </div>
                </ResultCard>

                <ResultCard
                  title="Pinterest titles"
                  platform="Legacy"
                  copyText={result.pinterestTitles.join("\n")}
                >
                  <ul className="space-y-2 text-sm text-foreground">
                    {result.pinterestTitles.map((title, index) => (
                      <li
                        key={`${index}-${title}`}
                        className="rounded-lg bg-surface-2/60 p-2"
                      >
                        {title}
                      </li>
                    ))}
                  </ul>
                </ResultCard>
                <ResultCard
                  title="Pinterest descriptions"
                  platform="Legacy"
                  copyText={result.pinterestDescriptions.join("\n")}
                >
                  <ul className="space-y-2 text-sm text-foreground">
                    {result.pinterestDescriptions.map((desc, index) => (
                      <li
                        key={`${index}-${desc}`}
                        className="rounded-lg bg-surface-2/60 p-2"
                      >
                        {desc}
                      </li>
                    ))}
                  </ul>
                </ResultCard>
                <ResultCard
                  title="Instagram caption"
                  platform="Legacy"
                  copyText={result.instagramCaption}
                >
                  <div className="space-y-3">{renderParagraphs(result.instagramCaption)}</div>
                </ResultCard>
                <ResultCard
                  title="LinkedIn post"
                  platform="Legacy"
                  copyText={result.linkedinPost}
                >
                  <div className="space-y-3">{renderParagraphs(result.linkedinPost)}</div>
                </ResultCard>
                <ResultCard
                  title="Hashtags"
                  platform="Legacy"
                  copyText={result.hashtags.join(" ")}
                >
                  <div className="flex flex-wrap gap-2">
                    {result.hashtags.map((tag, index) => (
                      <Badge key={`${index}-${tag}`}>{tag}</Badge>
                    ))}
                  </div>
                </ResultCard>
                <ResultCard
                  title="Canva design idea"
                  platform="Legacy"
                  copyText={result.canvaIdea}
                >
                  <p className="text-sm text-foreground">{result.canvaIdea}</p>
                </ResultCard>
                <ResultCard
                  title="Short-form video hook"
                  platform="Legacy"
                  copyText={result.videoHook}
                >
                  <p className="text-base font-semibold text-foreground">
                    {result.videoHook}
                  </p>
                </ResultCard>
              </div>
            </div>
          ) : error ? (
            <Card className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-muted">
                  Generation status
                </p>
                <h3 className="mt-2 font-display text-xl text-foreground">
                  {isAiUnavailableError
                    ? "AI is temporarily unavailable."
                    : "Could not create a valid weekly plan."}
                </h3>
                <p className="mt-2 text-sm text-muted">
                  {isAiUnavailableError
                    ? "Please retry in a moment. Your workflow inputs are still here."
                    : "The AI response was incomplete. Please try again."}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button variant="secondary" onClick={() => setError(null)}>
                  Dismiss
                </Button>
                <Button onClick={() => setOnboardingOpen(true)}>
                  Open examples
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-muted">
                  No weekly plan yet
                </p>
                <h3 className="mt-2 font-display text-xl text-foreground">
                  Build your first weekly marketing workflow.
                </h3>
                <p className="mt-2 text-sm text-muted">
                  Your first weekly plan will appear here after generation.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                {onboardingSamples.map((sample) => (
                  <Button
                    key={sample.label}
                    variant="secondary"
                    onClick={() => handleLoadSample(sample)}
                  >
                    {sample.label}
                  </Button>
                ))}
              </div>
            </Card>
          )}
        </div>

        <Card className="h-fit">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.3em] text-muted">
              History
            </p>
            {loading ? (
              <span className="text-xs text-muted">Updating...</span>
            ) : null}
          </div>
          <div className="mt-4 space-y-3">
            {loading && history.length === 0 ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-16" />
                ))}
              </div>
            ) : history.length === 0 ? (
              <p className="text-sm text-muted">
                No generation history yet. Run a weekly workflow to build your reusable plan library.
              </p>
            ) : (
              history.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item)}
                  className={
                    item.id === activeId
                      ? "w-full rounded-xl border border-brand/60 bg-surface-2/80 p-3 text-left"
                      : "w-full rounded-xl border border-border/60 bg-surface/70 p-3 text-left transition hover:border-border"
                  }
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted">
                      {dateFormatter.format(new Date(item.createdAt))}
                    </p>
                    {item.id === activeId ? (
                      <Badge className="bg-brand/20 text-foreground">Active</Badge>
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm font-medium text-foreground">
                    {item.topic}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    {item.niche} - {item.tone ?? "Neutral"}
                    {extractWorkflowGoal(item.result)
                      ? ` - Goal: ${extractWorkflowGoal(item.result)}`
                      : ""}
                  </p>
                </button>
              ))
            )}
          </div>
        </Card>
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
    </div>
  );
}

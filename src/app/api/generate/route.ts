import { NextResponse } from "next/server";
import { generateContent } from "@/lib/ai";
import { buildBrandPromptContext } from "@/lib/brand-profiles/format";
import { isContentPackOutput } from "@/lib/content-pack/guards";
import { resolveTemplate } from "@/lib/prompts/templates";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { fetchBrandProfileById, insertGeneration } from "@/lib/supabase/queries";
import { consumeUsage, refundUsage } from "@/lib/usage";
import type {
  GenerationContext,
  GenerationRequest,
  GenerationResponse,
} from "@/types/generation";

const REFUNDED_MARKER = "[USAGE_REFUNDED]";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.every((item) => typeof item === "string" && item.trim().length > 0)
  );
}

function cleanStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter((item) => item.length > 0)
    .slice(0, 5);
}

function isGenerationRequest(value: unknown): value is GenerationRequest {
  if (!isRecord(value)) {
    return false;
  }

  const hasValidBase = (
    isNonEmptyString(value.niche) &&
    isNonEmptyString(value.audience) &&
    isNonEmptyString(value.topic) &&
    isNonEmptyString(value.tone)
  );

  if (!hasValidBase) {
    return false;
  }

  if (
    value.brandProfileId !== undefined &&
    value.brandProfileId !== null &&
    !isNonEmptyString(value.brandProfileId)
  ) {
    return false;
  }

  if (
    value.contentTemplateId !== undefined &&
    value.contentTemplateId !== null &&
    !isNonEmptyString(value.contentTemplateId)
  ) {
    return false;
  }

  if (
    value.weeklyGoal !== undefined &&
    value.weeklyGoal !== null &&
    !isNonEmptyString(value.weeklyGoal)
  ) {
    return false;
  }

  if (
    value.platformFocus !== undefined &&
    value.platformFocus !== null &&
    !isStringArray(value.platformFocus)
  ) {
    return false;
  }

  return true;
}

function toUserFacingGenerationError(
  message: string,
  usageRefunded: boolean
): string {
  const normalized = message.toLowerCase();

  const aiUnavailable =
    normalized.includes("temporarily unavailable") ||
    normalized.includes("no compatible gemini model available") ||
    normalized.includes("gemini request failed") ||
    normalized.includes("missing gemini_api_key");

  if (aiUnavailable) {
    return "AI is temporarily unavailable. Please try again in a moment.";
  }

  const incompleteResponse =
    normalized.includes("invalid json") ||
    normalized.includes("incomplete json") ||
    normalized.includes("non-object json") ||
    normalized.includes("did not contain a json object") ||
    normalized.includes("quality validation failed") ||
    normalized.includes("invalid value for");

  if (incompleteResponse) {
    return usageRefunded
      ? "The AI response was incomplete. Please try again. Your usage was not charged for this failed generation."
      : "The AI response was incomplete. Please try again.";
  }

  return usageRefunded
    ? "We could not create a valid content pack this time. Please try again. Your usage was not charged for this failed generation."
    : "We could not create a valid content pack this time. Please try again.";
}

export async function POST(req: Request) {
  let payload: unknown;

  try {
    payload = await req.json();
  } catch {
    return NextResponse.json<GenerationResponse>(
      { success: false, error: "Invalid JSON payload." },
      { status: 400 }
    );
  }

  if (!isGenerationRequest(payload)) {
    return NextResponse.json<GenerationResponse>(
      { success: false, error: "Missing or invalid input fields." },
      { status: 400 }
    );
  }

  const normalizedPayload: GenerationRequest = {
    ...payload,
    weeklyGoal:
      typeof payload.weeklyGoal === "string"
        ? payload.weeklyGoal.trim()
        : null,
    platformFocus: cleanStringArray(payload.platformFocus),
  };

  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json<GenerationResponse>(
        { success: false, error: "Unauthorized." },
        { status: 401 }
      );
    }

    const usageCheck = await consumeUsage(supabase);
    if (!usageCheck.allowed) {
      return NextResponse.json<GenerationResponse>(
        {
          success: false,
          error: "Free plan limit reached. Upgrade to continue.",
          usage: usageCheck.usage,
        },
        { status: 429 }
      );
    }

    try {
      const brandProfile = normalizedPayload.brandProfileId
        ? await fetchBrandProfileById(supabase, normalizedPayload.brandProfileId)
        : null;
      const platformFocus =
        normalizedPayload.platformFocus && normalizedPayload.platformFocus.length > 0
          ? normalizedPayload.platformFocus
          : (brandProfile?.platformFocus ?? []);
      const weeklyGoal =
        normalizedPayload.weeklyGoal ||
        brandProfile?.postingGoals ||
        "increase engagement";
      const generationInput: GenerationRequest = {
        ...normalizedPayload,
        weeklyGoal,
        platformFocus,
      };
      const brandContext = buildBrandPromptContext(brandProfile, {
        tone: generationInput.tone,
        audience: generationInput.audience,
      });
      const template = resolveTemplate(generationInput.contentTemplateId);

      const generated = await generateContent(generationInput, {
        brandContext,
        contentTemplateId: template.id,
      });
      const data = isContentPackOutput(generated)
        ? {
            ...generated,
            weeklyWorkflow: {
              strategySummary:
                generated.weeklyWorkflow?.strategySummary ??
                generated.strategy.postingAngle ??
                "Structured weekly execution plan.",
              contentTheme:
                generated.weeklyWorkflow?.contentTheme ??
                generated.carousel.title ??
                generationInput.topic,
              audienceAngle:
                generated.weeklyWorkflow?.audienceAngle ??
                generationInput.audience,
              platformFocus:
                generated.weeklyWorkflow?.platformFocus?.length
                  ? generated.weeklyWorkflow.platformFocus
                  : platformFocus.length > 0
                    ? platformFocus
                    : undefined,
              postingSequence:
                generated.weeklyWorkflow?.postingSequence ??
                generated.weeklyPlan.map(
                  (item) => `${item.day}: ${item.platform} ${item.postType}`
                ),
              recommendedContentOrder:
                generated.weeklyWorkflow?.recommendedContentOrder ??
                generated.weeklyPlan.map(
                  (item) => `${item.day}: ${item.postType}`
                ),
              carouselConcept:
                generated.weeklyWorkflow?.carouselConcept ??
                generated.carousel.title,
              reelConcept:
                generated.weeklyWorkflow?.reelConcept ??
                generated.reelScript.hook,
              repurposeIdea:
                generated.weeklyWorkflow?.repurposeIdea ??
                generated.pinterestPins[0]?.visualIdea ??
                "Repurpose your strongest carousel into short-form video and a pin.",
            },
            generationContext: {
              workflowMode: "weekly-marketing-workflow" as const,
              weeklyGoal,
              platformFocus,
              brandProfileId: brandProfile?.id ?? null,
              brandProfileName: brandProfile?.name ?? null,
              contentTemplateId: template.id,
              contentTemplateName: template.label,
            } satisfies GenerationContext,
          }
        : generated;

      const record = await insertGeneration(supabase, user.id, generationInput, data);

      return NextResponse.json<GenerationResponse>({
        success: true,
        data,
        record,
        usage: usageCheck.usage,
      });
    } catch (generationError) {
      const generationMessage =
        generationError instanceof Error
          ? generationError.message
          : "Generation failed";
      let refunded = false;
      try {
        await refundUsage(supabase);
        refunded = true;
      } catch (refundError) {
        console.error("[generate] Failed to refund usage after generation error.", {
          generationMessage,
          refundError,
        });
      }
      throw new Error(
        `${refunded ? REFUNDED_MARKER : ""}${generationMessage}`
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Generation failed";
    const usageRefunded = message.startsWith(REFUNDED_MARKER);
    const rawDetail = usageRefunded
      ? message.slice(REFUNDED_MARKER.length)
      : message;

    console.error("[generate] Generation request failed.", {
      message: rawDetail,
      usageRefunded,
      error,
    });

    return NextResponse.json<GenerationResponse>(
      {
        success: false,
        error: toUserFacingGenerationError(rawDetail, usageRefunded),
      },
      { status: 500 }
    );
  }
}

import type {
  ContentPackOutput,
  ContentTemplateId,
  GenerationInput,
  GenerationOutput,
  WeeklyPlanDay,
  WeeklyWorkflowSummary,
} from "@/types/generation";
import { validateContentPackQuality } from "@/lib/ai-quality";
import type { BrandPromptContext } from "@/lib/brand-profiles/format";
import { buildPrompt, buildRetryPrompt } from "@/lib/prompts";

const GEMINI_API_VERSION = process.env.GEMINI_API_VERSION?.trim() || "v1beta";
const DEFAULT_GEMINI_MODELS = ["gemini-2.5-flash", "gemini-2.0-flash"];
const DEFAULT_MAX_OUTPUT_TOKENS = 3200;
const MAX_OUTPUT_TOKENS_CAP = 8192;
const MAX_ATTEMPTS = 3;

type GeminiPart = { text?: string };
type GeminiContent = { parts?: GeminiPart[] };
type GeminiCandidate = {
  content?: GeminiContent;
  finishReason?: string;
  finishMessage?: string;
};
type GeminiResponse = { candidates?: GeminiCandidate[] };
type JsonSchema = {
  type?: string | string[];
  properties?: Record<string, JsonSchema>;
  items?: JsonSchema;
  required?: string[];
  enum?: string[];
  minItems?: number;
  maxItems?: number;
  additionalProperties?: boolean;
};

const CONTENT_PACK_JSON_SCHEMA: JsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "version",
    "strategy",
    "carousel",
    "reelScript",
    "pinterestPins",
    "weeklyPlan",
    "ctaVariations",
    "engagementPrompts",
    "captionVariations",
    "hookVariations",
  ],
  properties: {
    version: {
      type: "string",
      enum: ["content-pack-v1"],
    },
    strategy: {
      type: "object",
      additionalProperties: false,
      required: ["postingAngle", "painPoint", "engagementStrategy"],
      properties: {
        postingAngle: { type: "string" },
        painPoint: { type: "string" },
        engagementStrategy: { type: "string" },
      },
    },
    carousel: {
      type: "object",
      additionalProperties: false,
      required: ["title", "slides"],
      properties: {
        title: { type: "string" },
        slides: {
          type: "array",
          minItems: 5,
          maxItems: 8,
          items: { type: "string" },
        },
      },
    },
    reelScript: {
      type: "object",
      additionalProperties: false,
      required: ["hook", "talkingPoints", "cta"],
      properties: {
        hook: { type: "string" },
        talkingPoints: {
          type: "array",
          minItems: 3,
          maxItems: 5,
          items: { type: "string" },
        },
        cta: { type: "string" },
      },
    },
    pinterestPins: {
      type: "array",
      minItems: 4,
      maxItems: 4,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "description", "visualIdea"],
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          visualIdea: { type: "string" },
        },
      },
    },
    weeklyPlan: {
      type: "array",
      minItems: 7,
      maxItems: 7,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["day", "platform", "postType", "goal", "engagementFocus"],
        properties: {
          day: { type: "string" },
          platform: { type: "string" },
          postType: { type: "string" },
          goal: { type: "string" },
          engagementFocus: { type: "string" },
        },
      },
    },
    ctaVariations: {
      type: "object",
      additionalProperties: false,
      required: ["soft", "aggressive", "curiosity", "leadMagnet"],
      properties: {
        soft: { type: "string" },
        aggressive: { type: "string" },
        curiosity: { type: "string" },
        leadMagnet: { type: "string" },
      },
    },
    engagementPrompts: {
      type: "array",
      minItems: 4,
      maxItems: 4,
      items: { type: "string" },
    },
    captionVariations: {
      type: "array",
      minItems: 4,
      maxItems: 4,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["style", "caption"],
        properties: {
          style: { type: "string" },
          caption: { type: "string" },
        },
      },
    },
    hookVariations: {
      type: "array",
      minItems: 4,
      maxItems: 4,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["format", "hook"],
        properties: {
          format: { type: "string" },
          hook: { type: "string" },
        },
      },
    },
    weeklyWorkflow: {
      type: "object",
      additionalProperties: false,
      required: ["strategySummary", "contentTheme", "postingSequence"],
      properties: {
        strategySummary: { type: "string" },
        contentTheme: { type: "string" },
        audienceAngle: { type: "string" },
        platformFocus: {
          type: "array",
          minItems: 1,
          maxItems: 5,
          items: { type: "string" },
        },
        postingSequence: {
          type: "array",
          minItems: 5,
          maxItems: 7,
          items: { type: "string" },
        },
        recommendedContentOrder: {
          type: "array",
          minItems: 3,
          maxItems: 7,
          items: { type: "string" },
        },
        carouselConcept: { type: "string" },
        reelConcept: { type: "string" },
        repurposeIdea: { type: "string" },
      },
    },
  },
};

function normalizeModelName(value: string): string {
  return value.replace(/^models\//i, "").trim();
}

function getGeminiModelCandidates(): string[] {
  const configured = (process.env.GEMINI_MODEL || "")
    .split(",")
    .map((item) => normalizeModelName(item))
    .filter((item) => item.length > 0);

  const merged = [...configured, ...DEFAULT_GEMINI_MODELS];
  return [...new Set(merged)];
}

function isUnavailableModelError(status: number, errorText: string): boolean {
  if (status !== 404) {
    return false;
  }

  return (
    errorText.includes("is not found for API version") ||
    errorText.includes("is not supported for generateContent")
  );
}

function buildJsonModeConfig(): Record<string, unknown> {
  return {
    responseMimeType: "application/json",
    responseJsonSchema: CONTENT_PACK_JSON_SCHEMA,
  };
}

function getConfiguredMaxOutputTokens(): number {
  const configured = Number.parseInt(
    process.env.GEMINI_MAX_OUTPUT_TOKENS ?? "",
    10
  );
  if (Number.isFinite(configured) && configured > 0) {
    return Math.min(configured, MAX_OUTPUT_TOKENS_CAP);
  }
  return DEFAULT_MAX_OUTPUT_TOKENS;
}

function getMaxOutputTokensForAttempt(attempt: number): number {
  const base = getConfiguredMaxOutputTokens();
  const stepped = base + (attempt - 1) * 800;
  return Math.min(stepped, MAX_OUTPUT_TOKENS_CAP);
}

function getGeminiApiKey(): string {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY environment variable.");
  }
  return apiKey;
}

function getTextFromResponse(data: GeminiResponse, maxOutputTokens: number): string {
  const candidate = data.candidates?.[0];
  if (!candidate) {
    throw new Error("Gemini response did not include candidates.");
  }

  if (candidate.finishReason === "MAX_TOKENS") {
    throw new Error(
      `Gemini output was truncated (MAX_TOKENS at ${maxOutputTokens}).`
    );
  }

  const text = candidate.content?.parts?.[0]?.text?.trim();
  if (!text) {
    const finishInfo = candidate.finishReason
      ? ` finishReason=${candidate.finishReason}`
      : "";
    const finishMessage = candidate.finishMessage
      ? ` finishMessage=${candidate.finishMessage}`
      : "";
    throw new Error(
      `Gemini response did not include text content.${finishInfo}${finishMessage}`
    );
  }
  return text;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function assertString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Invalid value for ${field}.`);
  }
  return value.trim();
}

function assertStringArrayRange(
  value: unknown,
  field: string,
  min: number,
  max: number
): string[] {
  if (!Array.isArray(value)) {
    throw new Error(`Invalid value for ${field}.`);
  }

  const trimmed = value.map((item, index) =>
    assertString(item, `${field}[${index}]`)
  );

  if (trimmed.length < min) {
    throw new Error(`${field} must contain at least ${min} items.`);
  }

  return trimmed.slice(0, max);
}

function assertRecordValue(value: unknown, field: string): Record<string, unknown> {
  if (!isRecord(value)) {
    throw new Error(`Invalid value for ${field}.`);
  }
  return value;
}

function assertObjectArray(
  value: unknown,
  field: string,
  min: number,
  max: number
): Record<string, unknown>[] {
  if (!Array.isArray(value)) {
    throw new Error(`Invalid value for ${field}.`);
  }

  if (value.length < min) {
    throw new Error(`${field} must contain at least ${min} items.`);
  }

  return value.slice(0, max).map((item, index) =>
    assertRecordValue(item, `${field}[${index}]`)
  );
}

function preview(value: string, limit = 280): string {
  const compact = value.replace(/\s+/g, " ").trim();
  if (compact.length <= limit) {
    return compact;
  }
  return `${compact.slice(0, limit)}...`;
}

function normalizeJsonLikeText(raw: string): string {
  return raw
    .replace(/\uFEFF/g, "")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2018\u2019]/g, "'")
    .trim();
}

function stripMarkdownFences(raw: string): string {
  return raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function extractBalancedJsonObject(raw: string): string | null {
  let start = raw.indexOf("{");
  while (start >= 0) {
    let depth = 0;
    let inString = false;
    let escaped = false;

    for (let index = start; index < raw.length; index += 1) {
      const char = raw[index];

      if (inString) {
        if (escaped) {
          escaped = false;
          continue;
        }
        if (char === "\\") {
          escaped = true;
          continue;
        }
        if (char === '"') {
          inString = false;
        }
        continue;
      }

      if (char === '"') {
        inString = true;
        continue;
      }

      if (char === "{") {
        depth += 1;
      } else if (char === "}") {
        depth -= 1;
        if (depth === 0) {
          return raw.slice(start, index + 1);
        }
        if (depth < 0) {
          break;
        }
      }
    }

    start = raw.indexOf("{", start + 1);
  }

  return null;
}

function hasUnclosedBraces(raw: string): boolean {
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = 0; index < raw.length; index += 1) {
    const char = raw[index];
    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === "\\") {
        escaped = true;
        continue;
      }
      if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === "{") {
      depth += 1;
    } else if (char === "}") {
      depth = Math.max(0, depth - 1);
    }
  }

  return depth > 0;
}

function stripTrailingCommas(raw: string): string {
  return raw.replace(/,\s*([}\]])/g, "$1");
}

function attemptParseJson(raw: string): { value: unknown; usedRepair: boolean } {
  try {
    return { value: JSON.parse(raw), usedRepair: false };
  } catch (firstError) {
    const repaired = stripTrailingCommas(raw);
    if (repaired !== raw) {
      try {
        return { value: JSON.parse(repaired), usedRepair: true };
      } catch {
        const firstMessage =
          firstError instanceof Error ? firstError.message : "Unknown parse error";
        throw new Error(firstMessage);
      }
    }

    const firstMessage =
      firstError instanceof Error ? firstError.message : "Unknown parse error";
    throw new Error(firstMessage);
  }
}

function getOptionalString(
  value: unknown,
  field: string
): string | null | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  return assertString(value, field);
}

function getOptionalStringArray(
  value: unknown,
  field: string,
  min: number,
  max: number
): string[] | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  return assertStringArrayRange(value, field, min, max);
}

function parseOutput(raw: string): ContentPackOutput {
  const normalized = normalizeJsonLikeText(raw);
  if (!normalized) {
    throw new Error("Gemini returned an empty response.");
  }

  const withoutFences = stripMarkdownFences(normalized);
  const extracted = extractBalancedJsonObject(withoutFences);
  const candidate = extracted ?? withoutFences;

  if (!candidate.includes("{")) {
    throw new Error(
      `Gemini response did not contain a JSON object. Preview: ${preview(candidate)}`
    );
  }

  if (!extracted && hasUnclosedBraces(candidate)) {
    throw new Error("Gemini returned incomplete JSON (truncated response).");
  }

  let parsed: unknown;

  try {
    const parseResult = attemptParseJson(candidate);
    parsed = parseResult.value;

    if (parseResult.usedRepair) {
      console.warn(
        `[AI] Applied lightweight JSON repair for trailing commas. Preview: ${preview(
          candidate
        )}`
      );
    }
  } catch (parseError) {
    const parseMessage =
      parseError instanceof Error ? parseError.message : "Unknown parse error";
    throw new Error(
      `Gemini returned invalid JSON (${parseMessage}). Preview: ${preview(candidate)}`
    );
  }

  if (!isRecord(parsed)) {
    throw new Error("Gemini returned a non-object JSON payload.");
  }

  if (parsed.version !== "content-pack-v1") {
    throw new Error("Missing or invalid version field.");
  }

  const strategyRecord = assertRecordValue(parsed.strategy, "strategy");
  const strategy = {
    postingAngle: assertString(strategyRecord.postingAngle, "strategy.postingAngle"),
    painPoint: assertString(strategyRecord.painPoint, "strategy.painPoint"),
    engagementStrategy: assertString(
      strategyRecord.engagementStrategy,
      "strategy.engagementStrategy"
    ),
  };

  const carouselRecord = assertRecordValue(parsed.carousel, "carousel");
  const carousel = {
    title: assertString(carouselRecord.title, "carousel.title"),
    slides: assertStringArrayRange(carouselRecord.slides, "carousel.slides", 5, 8),
  };

  const reelRecord = assertRecordValue(parsed.reelScript, "reelScript");
  const reelScript = {
    hook: assertString(reelRecord.hook, "reelScript.hook"),
    talkingPoints: assertStringArrayRange(
      reelRecord.talkingPoints,
      "reelScript.talkingPoints",
      3,
      5
    ),
    cta: assertString(reelRecord.cta, "reelScript.cta"),
  };

  const pinterestPins = assertObjectArray(
    parsed.pinterestPins,
    "pinterestPins",
    4,
    4
  ).map((pin) => ({
    title: assertString(pin.title, "pinterestPins.title"),
    description: assertString(pin.description, "pinterestPins.description"),
    visualIdea: assertString(pin.visualIdea, "pinterestPins.visualIdea"),
  }));

  const weeklyPlan = assertObjectArray(
    parsed.weeklyPlan,
    "weeklyPlan",
    7,
    7
  ).map((day) => ({
    day: assertString(day.day, "weeklyPlan.day"),
    platform: assertString(day.platform, "weeklyPlan.platform"),
    postType: assertString(day.postType, "weeklyPlan.postType"),
    goal: assertString(day.goal, "weeklyPlan.goal"),
    engagementFocus: assertString(day.engagementFocus, "weeklyPlan.engagementFocus"),
  })) as WeeklyPlanDay[];

  const ctaRecord = assertRecordValue(parsed.ctaVariations, "ctaVariations");
  const ctaVariations = {
    soft: assertString(ctaRecord.soft, "ctaVariations.soft"),
    aggressive: assertString(ctaRecord.aggressive, "ctaVariations.aggressive"),
    curiosity: assertString(ctaRecord.curiosity, "ctaVariations.curiosity"),
    leadMagnet: assertString(ctaRecord.leadMagnet, "ctaVariations.leadMagnet"),
  };

  const engagementPrompts = assertStringArrayRange(
    parsed.engagementPrompts,
    "engagementPrompts",
    4,
    4
  );

  const captionVariations = assertObjectArray(
    parsed.captionVariations,
    "captionVariations",
    4,
    4
  ).map((item) => ({
    style: assertString(item.style, "captionVariations.style"),
    caption: assertString(item.caption, "captionVariations.caption"),
  }));

  const hookVariations = assertObjectArray(
    parsed.hookVariations,
    "hookVariations",
    4,
    4
  ).map((item) => ({
    format: assertString(item.format, "hookVariations.format"),
    hook: assertString(item.hook, "hookVariations.hook"),
  }));

  let weeklyWorkflow: WeeklyWorkflowSummary | undefined;
  if (parsed.weeklyWorkflow !== undefined && parsed.weeklyWorkflow !== null) {
    const workflowRecord = assertRecordValue(parsed.weeklyWorkflow, "weeklyWorkflow");
    weeklyWorkflow = {
      strategySummary: assertString(
        workflowRecord.strategySummary,
        "weeklyWorkflow.strategySummary"
      ),
      contentTheme: assertString(
        workflowRecord.contentTheme,
        "weeklyWorkflow.contentTheme"
      ),
      audienceAngle: getOptionalString(
        workflowRecord.audienceAngle,
        "weeklyWorkflow.audienceAngle"
      ),
      platformFocus: getOptionalStringArray(
        workflowRecord.platformFocus,
        "weeklyWorkflow.platformFocus",
        1,
        5
      ),
      postingSequence: assertStringArrayRange(
        workflowRecord.postingSequence,
        "weeklyWorkflow.postingSequence",
        5,
        7
      ),
      recommendedContentOrder: getOptionalStringArray(
        workflowRecord.recommendedContentOrder,
        "weeklyWorkflow.recommendedContentOrder",
        3,
        7
      ),
      carouselConcept: getOptionalString(
        workflowRecord.carouselConcept,
        "weeklyWorkflow.carouselConcept"
      ),
      reelConcept: getOptionalString(
        workflowRecord.reelConcept,
        "weeklyWorkflow.reelConcept"
      ),
      repurposeIdea:
        getOptionalString(
          workflowRecord.repurposeIdea,
          "weeklyWorkflow.repurposeIdea"
        ) ?? null,
    };
  }

  const output: ContentPackOutput = {
    version: "content-pack-v1",
    strategy,
    carousel,
    reelScript,
    pinterestPins,
    weeklyPlan,
    ctaVariations,
    engagementPrompts,
    captionVariations,
    hookVariations,
    weeklyWorkflow,
  };

  return output;
}

async function requestGemini(prompt: string, attempt: number): Promise<string> {
  const apiKey = getGeminiApiKey();
  const modelCandidates = getGeminiModelCandidates();
  const maxOutputTokens = getMaxOutputTokensForAttempt(attempt);
  let lastError = "No compatible Gemini model available.";

  for (let index = 0; index < modelCandidates.length; index += 1) {
    const model = modelCandidates[index];
    const response = await fetch(
      `https://generativelanguage.googleapis.com/${GEMINI_API_VERSION}/models/${model}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.45,
            topP: 0.9,
            maxOutputTokens,
            ...buildJsonModeConfig(),
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      if (
        isUnavailableModelError(response.status, errorText) &&
        index < modelCandidates.length - 1
      ) {
        console.warn(
          `[AI] Model '${model}' unavailable (${response.status}). Trying fallback.`
        );
        lastError = `Gemini model '${model}' unavailable. Tried fallback model.`;
        continue;
      }

      throw new Error(`Gemini request failed (${model}): ${errorText}`);
    }

    const data = (await response.json()) as GeminiResponse;
    return getTextFromResponse(data, maxOutputTokens);
  }

  throw new Error(lastError);
}

export async function generateContent(
  input: GenerationInput,
  options: {
    brandContext?: BrandPromptContext | null;
    contentTemplateId?: ContentTemplateId | string | null;
  } = {}
): Promise<GenerationOutput> {
  let lastError = "Unknown error";

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    const prompt =
      attempt === 1
        ? buildPrompt(input, options)
        : buildRetryPrompt(input, lastError, options);

    try {
      const rawText = await requestGemini(prompt, attempt);
      const parsedOutput = parseOutput(rawText);
      const qualityIssue = validateContentPackQuality(parsedOutput, {
        requireWeeklyWorkflow: true,
        forbiddenPhrases: options.brandContext?.forbiddenPhrases ?? [],
      });
      if (qualityIssue) {
        throw new Error(`AI quality validation failed: ${qualityIssue}`);
      }
      return parsedOutput;
    } catch (error) {
      lastError =
        error instanceof Error ? error.message : "Unknown generation error";
      console.warn(
        `[AI] Generation attempt ${attempt}/${MAX_ATTEMPTS} failed: ${lastError}`
      );
    }
  }

  throw new Error(lastError);
}

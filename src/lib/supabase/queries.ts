import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  BrandProfile,
  BrandProfileInput,
  BrandProfileUpdate,
} from "@/types/brand-profile";
import type {
  GenerationInput,
  GenerationOutput,
  GenerationRecord,
} from "@/types/generation";
import type { Database } from "@/types/supabase";

type QueryClient = Pick<SupabaseClient<Database>, "from">;

function mapGenerationRow(
  row: Database["public"]["Tables"]["generations"]["Row"]
): GenerationRecord {
  return {
    id: row.id,
    userId: row.user_id,
    niche: row.niche,
    audience: row.audience,
    topic: row.topic,
    tone: row.tone,
    result: row.result_json as GenerationOutput,
    createdAt: row.created_at,
  };
}

function mapBrandProfileRow(
  row: Database["public"]["Tables"]["brand_profiles"]["Row"]
): BrandProfile {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    businessDescription: row.business_description,
    targetAudience: row.target_audience,
    offer: row.offer,
    toneOfVoice: row.tone_of_voice,
    ctaStyle: row.cta_style,
    platformFocus: row.platform_focus ?? [],
    brandKeywords: row.brand_keywords ?? [],
    forbiddenPhrases: row.forbidden_phrases ?? [],
    writingStyle: row.writing_style,
    postingGoals: row.posting_goals,
    profileVersion: row.profile_version ?? 1,
    metadata:
      row.metadata && typeof row.metadata === "object" && !Array.isArray(row.metadata)
        ? (row.metadata as Record<string, unknown>)
        : {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const generationSelect =
  "id, user_id, niche, audience, topic, tone, result_json, created_at";

const brandProfileSelect =
  "id, user_id, name, business_description, target_audience, offer, tone_of_voice, cta_style, platform_focus, brand_keywords, forbidden_phrases, writing_style, posting_goals, profile_version, metadata, created_at, updated_at";

export async function fetchGenerations(
  client: QueryClient,
  limit = 20
): Promise<GenerationRecord[]> {
  const { data, error } = await client
    .from("generations")
    .select(generationSelect)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapGenerationRow);
}

export async function insertGeneration(
  client: QueryClient,
  userId: string,
  input: GenerationInput,
  output: GenerationOutput
): Promise<GenerationRecord> {
  const { data, error } = await client
    .from("generations")
    .insert({
      user_id: userId,
      niche: input.niche,
      audience: input.audience,
      topic: input.topic,
      tone: input.tone,
      result_json: output,
    })
    .select(generationSelect)
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to save generation.");
  }

  return mapGenerationRow(data);
}

export async function fetchBrandProfiles(
  client: QueryClient
): Promise<BrandProfile[]> {
  const { data, error } = await client
    .from("brand_profiles")
    .select(brandProfileSelect)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapBrandProfileRow);
}

export async function fetchBrandProfileById(
  client: QueryClient,
  id: string
): Promise<BrandProfile | null> {
  const { data, error } = await client
    .from("brand_profiles")
    .select(brandProfileSelect)
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(error.message);
  }

  return data ? mapBrandProfileRow(data) : null;
}

export async function createBrandProfile(
  client: QueryClient,
  userId: string,
  input: BrandProfileInput
): Promise<BrandProfile> {
  const { data, error } = await client
    .from("brand_profiles")
    .insert({
      user_id: userId,
      name: input.name,
      business_description: input.businessDescription ?? null,
      target_audience: input.targetAudience ?? null,
      offer: input.offer ?? null,
      tone_of_voice: input.toneOfVoice ?? null,
      cta_style: input.ctaStyle ?? null,
      platform_focus: input.platformFocus ?? [],
      brand_keywords: input.brandKeywords ?? [],
      forbidden_phrases: input.forbiddenPhrases ?? [],
      writing_style: input.writingStyle ?? null,
      posting_goals: input.postingGoals ?? null,
      metadata: {},
    })
    .select(brandProfileSelect)
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to create profile.");
  }

  return mapBrandProfileRow(data);
}

export async function updateBrandProfile(
  client: QueryClient,
  id: string,
  input: BrandProfileUpdate
): Promise<BrandProfile> {
  const updatePayload: Database["public"]["Tables"]["brand_profiles"]["Update"] = {
    name: input.name,
    business_description: input.businessDescription ?? undefined,
    target_audience: input.targetAudience ?? undefined,
    offer: input.offer ?? undefined,
    tone_of_voice: input.toneOfVoice ?? undefined,
    cta_style: input.ctaStyle ?? undefined,
    platform_focus: input.platformFocus ?? undefined,
    brand_keywords: input.brandKeywords ?? undefined,
    forbidden_phrases: input.forbiddenPhrases ?? undefined,
    writing_style: input.writingStyle ?? undefined,
    posting_goals: input.postingGoals ?? undefined,
  };

  const { data, error } = await client
    .from("brand_profiles")
    .update(updatePayload)
    .eq("id", id)
    .select(brandProfileSelect)
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to update profile.");
  }

  return mapBrandProfileRow(data);
}

export async function deleteBrandProfile(
  client: QueryClient,
  id: string
): Promise<void> {
  const { error } = await client.from("brand_profiles").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function upsertProfile(
  client: QueryClient,
  userId: string,
  fullName: string
) {
  const { error } = await client.from("profiles").upsert({
    id: userId,
    full_name: fullName,
  });

  if (error) {
    throw new Error(error.message);
  }
}

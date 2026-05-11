import type { ContentTemplateId } from "@/types/generation";

type ContentTemplate = {
  id: ContentTemplateId;
  label: string;
  summary: string;
  affects: string[];
  guidance: string[];
};

const templates: ContentTemplate[] = [
  {
    id: "authority",
    label: "Authority Builder",
    summary: "Builds credibility with educational proof-driven messaging.",
    affects: ["hooks", "CTA framing", "content structure", "psychology"],
    guidance: [
      "Position the brand as a trusted expert through teachable insights and clear frameworks.",
      "Use calm confidence and specific proof points instead of hype claims.",
      "Favor educational hooks and actionable takeaways.",
    ],
  },
  {
    id: "engagement",
    label: "Engagement Engine",
    summary: "Optimizes for comments, saves, shares, and conversation loops.",
    affects: ["hooks", "community prompts", "content structure", "psychology"],
    guidance: [
      "Optimize for comments, shares, and saves with curiosity-driven phrasing.",
      "Use conversational prompts and opinion-friendly angles.",
      "Make each piece feel interactive and community-led.",
    ],
  },
  {
    id: "conversion",
    label: "Conversion Focus",
    summary: "Pushes clear next steps while keeping trust and relevance high.",
    affects: ["hooks", "CTA urgency", "offer clarity", "decision psychology"],
    guidance: [
      "Prioritize clarity of offer, urgency, and explicit next-step CTAs.",
      "Use benefit-first phrasing tied to outcomes for the target audience.",
      "Keep conversion intent strong without sounding aggressive or spammy.",
    ],
  },
  {
    id: "launch",
    label: "Launch Campaign",
    summary: "Creates momentum with a sequence from awareness to action.",
    affects: ["hooks", "CTA cadence", "weekly structure", "campaign psychology"],
    guidance: [
      "Frame outputs as part of a timed campaign with momentum across the week.",
      "Sequence awareness, proof, and conversion moments intentionally.",
      "Use scarcity and launch energy while preserving brand trust.",
    ],
  },
];

const defaultTemplate = templates[0];

export const CONTENT_TEMPLATE_OPTIONS = templates.map((template) => ({
  id: template.id,
  label: template.label,
  summary: template.summary,
  affects: template.affects,
}));

export function resolveTemplate(
  templateId: ContentTemplateId | string | null | undefined
): ContentTemplate {
  if (!templateId) {
    return defaultTemplate;
  }
  const match = templates.find((template) => template.id === templateId);
  return match ?? defaultTemplate;
}

export function buildTemplateLayer(
  templateId: ContentTemplateId | string | null | undefined
): string {
  const template = resolveTemplate(templateId);
  return [
    `Template mode: ${template.label}.`,
    ...template.guidance,
  ].join("\n");
}

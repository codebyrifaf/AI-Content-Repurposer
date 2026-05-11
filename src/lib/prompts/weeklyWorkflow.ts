import type { GenerationInput } from "@/types/generation";

function formatPlatformFocus(platformFocus: string[] | null | undefined): string {
  const values = (platformFocus ?? []).map((item) => item.trim()).filter(Boolean);
  return values.length > 0 ? values.join(", ") : "use the highest-fit mix for the niche";
}

function formatWeeklyGoal(weeklyGoal: string | null | undefined): string {
  const value = weeklyGoal?.trim();
  return value && value.length > 0 ? value : "increase engagement";
}

export function buildWeeklyWorkflowLayer(input: GenerationInput): string {
  return [
    "Weekly workflow directives:",
    `Primary weekly goal: ${formatWeeklyGoal(input.weeklyGoal)}.`,
    `Platform priority: ${formatPlatformFocus(input.platformFocus)}.`,
    "Design all outputs as one connected weekly campaign, not isolated posts.",
    "Start early-week with trust/education, then move toward proof and conversion.",
    "Ensure each content piece advances the weekly objective and sets up the next piece.",
    "Use sequencing across awareness, education, proof, and conversion based on the selected goal.",
    "Weekly workflow summary should include strategySummary, contentTheme, audienceAngle, postingSequence, and repurposeIdea when relevant.",
    "When possible, include platformFocus, recommendedContentOrder, carouselConcept, and reelConcept in weeklyWorkflow.",
    "Avoid filler, hype language, or vague promises.",
    "Keep cadence practical for solo operators: clear, realistic, and repeatable every week.",
  ].join("\n");
}

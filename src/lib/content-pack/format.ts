import type {
  ContentPackOutput,
  LegacyGenerationOutput,
  WeeklyPlanDay,
} from "@/types/generation";

function formatPlanLine(day: WeeklyPlanDay): string {
  return `${day.day}: ${day.platform} - ${day.postType}. Goal: ${day.goal}. Engagement: ${day.engagementFocus}.`;
}

function addGenerationContextMarkdown(lines: string[], output: ContentPackOutput) {
  const context = output.generationContext;
  if (!context) {
    return;
  }

  const metaLines: string[] = [];
  if (context.brandProfileName) {
    metaLines.push(`- Brand profile: ${context.brandProfileName}`);
  }
  if (context.contentTemplateName) {
    metaLines.push(`- Template: ${context.contentTemplateName}`);
  }
  if (context.weeklyGoal) {
    metaLines.push(`- Weekly goal: ${context.weeklyGoal}`);
  }
  if (context.platformFocus && context.platformFocus.length > 0) {
    metaLines.push(`- Platform focus: ${context.platformFocus.join(", ")}`);
  }

  if (metaLines.length === 0) {
    return;
  }

  lines.push("## Workflow Context");
  lines.push(...metaLines);
  lines.push("");
}

function addGenerationContextText(lines: string[], output: ContentPackOutput) {
  const context = output.generationContext;
  if (!context) {
    return;
  }

  const metaLines: string[] = [];
  if (context.brandProfileName) {
    metaLines.push(`Brand profile: ${context.brandProfileName}`);
  }
  if (context.contentTemplateName) {
    metaLines.push(`Template: ${context.contentTemplateName}`);
  }
  if (context.weeklyGoal) {
    metaLines.push(`Weekly goal: ${context.weeklyGoal}`);
  }
  if (context.platformFocus && context.platformFocus.length > 0) {
    metaLines.push(`Platform focus: ${context.platformFocus.join(", ")}`);
  }

  if (metaLines.length === 0) {
    return;
  }

  lines.push("WORKFLOW CONTEXT");
  lines.push(...metaLines);
  lines.push("");
}

export function buildContentPackMarkdown(output: ContentPackOutput): string {
  const lines: string[] = [];
  lines.push("# Content Pack");
  lines.push("");
  addGenerationContextMarkdown(lines, output);
  if (output.weeklyWorkflow) {
    lines.push("## Weekly Workflow");
    lines.push(`- Strategy summary: ${output.weeklyWorkflow.strategySummary}`);
    lines.push(`- Content theme: ${output.weeklyWorkflow.contentTheme}`);
    if (output.weeklyWorkflow.audienceAngle) {
      lines.push(`- Audience angle: ${output.weeklyWorkflow.audienceAngle}`);
    }
    if (output.weeklyWorkflow.platformFocus?.length) {
      lines.push(
        `- Platform focus: ${output.weeklyWorkflow.platformFocus.join(", ")}`
      );
    }
    lines.push("- Posting sequence:");
    output.weeklyWorkflow.postingSequence.forEach((step) => {
      lines.push(`  - ${step}`);
    });
    if (output.weeklyWorkflow.recommendedContentOrder?.length) {
      lines.push("- Recommended content order:");
      output.weeklyWorkflow.recommendedContentOrder.forEach((item) => {
        lines.push(`  - ${item}`);
      });
    }
    if (output.weeklyWorkflow.carouselConcept) {
      lines.push(`- Carousel concept: ${output.weeklyWorkflow.carouselConcept}`);
    }
    if (output.weeklyWorkflow.reelConcept) {
      lines.push(`- Reel concept: ${output.weeklyWorkflow.reelConcept}`);
    }
    if (output.weeklyWorkflow.repurposeIdea) {
      lines.push(`- Repurpose idea: ${output.weeklyWorkflow.repurposeIdea}`);
    }
    lines.push("");
  }

  lines.push("## Strategy");
  lines.push(`- Posting angle: ${output.strategy.postingAngle}`);
  lines.push(`- Pain point: ${output.strategy.painPoint}`);
  lines.push(`- Engagement strategy: ${output.strategy.engagementStrategy}`);
  lines.push("");
  lines.push("## Instagram Carousel");
  lines.push(`Title: ${output.carousel.title}`);
  output.carousel.slides.forEach((slide, index) => {
    lines.push(`${index + 1}. ${slide}`);
  });
  lines.push("");
  lines.push("## Reel Script");
  lines.push(`Hook: ${output.reelScript.hook}`);
  lines.push("Talking points:");
  output.reelScript.talkingPoints.forEach((point) => {
    lines.push(`- ${point}`);
  });
  lines.push(`CTA: ${output.reelScript.cta}`);
  lines.push("");
  lines.push("## Pinterest Pin Pack");
  output.pinterestPins.forEach((pin, index) => {
    lines.push(`Pin ${index + 1}: ${pin.title}`);
    lines.push(`- Description: ${pin.description}`);
    lines.push(`- Visual idea: ${pin.visualIdea}`);
  });
  lines.push("");
  lines.push("## Weekly Plan");
  output.weeklyPlan.forEach((day) => {
    lines.push(`- ${formatPlanLine(day)}`);
  });
  lines.push("");
  lines.push("## CTA Variations");
  lines.push(`- Soft: ${output.ctaVariations.soft}`);
  lines.push(`- Aggressive: ${output.ctaVariations.aggressive}`);
  lines.push(`- Curiosity: ${output.ctaVariations.curiosity}`);
  lines.push(`- Lead magnet: ${output.ctaVariations.leadMagnet}`);
  lines.push("");
  lines.push("## Engagement Prompts");
  output.engagementPrompts.forEach((prompt) => {
    lines.push(`- ${prompt}`);
  });
  lines.push("");
  lines.push("## Caption Variations");
  output.captionVariations.forEach((item) => {
    lines.push(`- ${item.style}: ${item.caption}`);
  });
  lines.push("");
  lines.push("## Hook Variations");
  output.hookVariations.forEach((item) => {
    lines.push(`- ${item.format}: ${item.hook}`);
  });
  lines.push("");
  return lines.join("\n");
}

export function buildContentPackText(output: ContentPackOutput): string {
  const lines: string[] = [];
  lines.push("CONTENT PACK");
  lines.push("");
  addGenerationContextText(lines, output);
  if (output.weeklyWorkflow) {
    lines.push("WEEKLY WORKFLOW");
    lines.push(`Strategy summary: ${output.weeklyWorkflow.strategySummary}`);
    lines.push(`Content theme: ${output.weeklyWorkflow.contentTheme}`);
    if (output.weeklyWorkflow.audienceAngle) {
      lines.push(`Audience angle: ${output.weeklyWorkflow.audienceAngle}`);
    }
    if (output.weeklyWorkflow.platformFocus?.length) {
      lines.push(`Platform focus: ${output.weeklyWorkflow.platformFocus.join(", ")}`);
    }
    lines.push("Posting sequence:");
    output.weeklyWorkflow.postingSequence.forEach((step, index) => {
      lines.push(`${index + 1}. ${step}`);
    });
    if (output.weeklyWorkflow.recommendedContentOrder?.length) {
      lines.push("Recommended content order:");
      output.weeklyWorkflow.recommendedContentOrder.forEach((item, index) => {
        lines.push(`${index + 1}. ${item}`);
      });
    }
    if (output.weeklyWorkflow.carouselConcept) {
      lines.push(`Carousel concept: ${output.weeklyWorkflow.carouselConcept}`);
    }
    if (output.weeklyWorkflow.reelConcept) {
      lines.push(`Reel concept: ${output.weeklyWorkflow.reelConcept}`);
    }
    if (output.weeklyWorkflow.repurposeIdea) {
      lines.push(`Repurpose idea: ${output.weeklyWorkflow.repurposeIdea}`);
    }
    lines.push("");
  }

  lines.push("STRATEGY");
  lines.push(`Posting angle: ${output.strategy.postingAngle}`);
  lines.push(`Pain point: ${output.strategy.painPoint}`);
  lines.push(`Engagement strategy: ${output.strategy.engagementStrategy}`);
  lines.push("");
  lines.push("INSTAGRAM CAROUSEL");
  lines.push(`Title: ${output.carousel.title}`);
  output.carousel.slides.forEach((slide, index) => {
    lines.push(`${index + 1}. ${slide}`);
  });
  lines.push("");
  lines.push("REEL SCRIPT");
  lines.push(`Hook: ${output.reelScript.hook}`);
  output.reelScript.talkingPoints.forEach((point, index) => {
    lines.push(`${index + 1}. ${point}`);
  });
  lines.push(`CTA: ${output.reelScript.cta}`);
  lines.push("");
  lines.push("PINTEREST PIN PACK");
  output.pinterestPins.forEach((pin, index) => {
    lines.push(`Pin ${index + 1}`);
    lines.push(`Title: ${pin.title}`);
    lines.push(`Description: ${pin.description}`);
    lines.push(`Visual idea: ${pin.visualIdea}`);
  });
  lines.push("");
  lines.push("WEEKLY PLAN");
  output.weeklyPlan.forEach((day) => {
    lines.push(formatPlanLine(day));
  });
  lines.push("");
  lines.push("CTA VARIATIONS");
  lines.push(`Soft: ${output.ctaVariations.soft}`);
  lines.push(`Aggressive: ${output.ctaVariations.aggressive}`);
  lines.push(`Curiosity: ${output.ctaVariations.curiosity}`);
  lines.push(`Lead magnet: ${output.ctaVariations.leadMagnet}`);
  lines.push("");
  lines.push("ENGAGEMENT PROMPTS");
  output.engagementPrompts.forEach((prompt) => {
    lines.push(`- ${prompt}`);
  });
  lines.push("");
  lines.push("CAPTION VARIATIONS");
  output.captionVariations.forEach((item) => {
    lines.push(`${item.style}: ${item.caption}`);
  });
  lines.push("");
  lines.push("HOOK VARIATIONS");
  output.hookVariations.forEach((item) => {
    lines.push(`${item.format}: ${item.hook}`);
  });
  lines.push("");
  return lines.join("\n");
}

export function buildLegacyMarkdown(output: LegacyGenerationOutput): string {
  const lines: string[] = [];
  lines.push("# Legacy Content Output");
  lines.push("");
  lines.push("## Strategy");
  lines.push(`- Posting angle: ${output.postingAngle}`);
  lines.push(`- Pain point: ${output.painPoint}`);
  lines.push(`- Engagement strategy: ${output.engagementStrategy}`);
  lines.push("");
  lines.push("## Pinterest Titles");
  output.pinterestTitles.forEach((title) => lines.push(`- ${title}`));
  lines.push("");
  lines.push("## Pinterest Descriptions");
  output.pinterestDescriptions.forEach((desc) => lines.push(`- ${desc}`));
  lines.push("");
  lines.push("## Instagram Caption");
  lines.push(output.instagramCaption);
  lines.push("");
  lines.push("## LinkedIn Post");
  lines.push(output.linkedinPost);
  lines.push("");
  lines.push("## Hashtags");
  lines.push(output.hashtags.join(" "));
  lines.push("");
  lines.push("## Canva Idea");
  lines.push(output.canvaIdea);
  lines.push("");
  lines.push("## Video Hook");
  lines.push(output.videoHook);
  lines.push("");
  return lines.join("\n");
}

export function buildLegacyText(output: LegacyGenerationOutput): string {
  const lines: string[] = [];
  lines.push("LEGACY CONTENT OUTPUT");
  lines.push("");
  lines.push("STRATEGY");
  lines.push(`Posting angle: ${output.postingAngle}`);
  lines.push(`Pain point: ${output.painPoint}`);
  lines.push(`Engagement strategy: ${output.engagementStrategy}`);
  lines.push("");
  lines.push("PINTEREST TITLES");
  output.pinterestTitles.forEach((title) => lines.push(title));
  lines.push("");
  lines.push("PINTEREST DESCRIPTIONS");
  output.pinterestDescriptions.forEach((desc) => lines.push(desc));
  lines.push("");
  lines.push("INSTAGRAM CAPTION");
  lines.push(output.instagramCaption);
  lines.push("");
  lines.push("LINKEDIN POST");
  lines.push(output.linkedinPost);
  lines.push("");
  lines.push("HASHTAGS");
  lines.push(output.hashtags.join(" "));
  lines.push("");
  lines.push("CANVA IDEA");
  lines.push(output.canvaIdea);
  lines.push("");
  lines.push("VIDEO HOOK");
  lines.push(output.videoHook);
  lines.push("");
  return lines.join("\n");
}

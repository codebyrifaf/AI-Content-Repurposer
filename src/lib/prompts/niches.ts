type NicheProfile = {
  label: string;
  vocabulary: string[];
  emotionalTriggers: string[];
  hooks: string[];
  ctas: string[];
  platformAngles: {
    pinterest: string;
    instagram: string;
    linkedin: string;
    video: string;
  };
};

export type NicheKey = "realtor" | "gym" | "restaurant" | "coach" | "general";

const nicheProfiles: Record<NicheKey, NicheProfile> = {
  realtor: {
    label: "Realtors",
    vocabulary: [
      "listing",
      "open house",
      "curb appeal",
      "neighborhood",
      "market update",
      "comps",
      "pre-approval",
      "staging",
      "escrow",
      "closing day",
    ],
    emotionalTriggers: ["security", "belonging", "timing", "pride of ownership"],
    hooks: [
      "Could this be your next address?",
      "The one detail that makes buyers stop scrolling",
      "A market shift most buyers miss",
    ],
    ctas: [
      "Book a private tour",
      "DM for current listings",
      "Get a free home valuation",
      "Schedule a showing",
    ],
    platformAngles: {
      pinterest: "home search tips, neighborhood highlights, staging ideas",
      instagram: "story-driven tours, behind-the-scenes, local lifestyle",
      linkedin: "market insights, data-backed advice, professional credibility",
      video: "quick market myth busts, fast tour hooks",
    },
  },
  gym: {
    label: "Gyms",
    vocabulary: [
      "PR",
      "strength",
      "conditioning",
      "mobility",
      "training block",
      "HIIT",
      "coaching",
      "progression",
      "form",
      "recovery",
    ],
    emotionalTriggers: ["confidence", "energy", "momentum", "discipline"],
    hooks: [
      "The 15-minute reset that changes your week",
      "The strength move most beginners skip",
      "Small wins that build real momentum",
    ],
    ctas: [
      "Claim a free trial",
      "Book your first class",
      "DM for a personalized plan",
      "Start your strength block",
    ],
    platformAngles: {
      pinterest: "workout plans, form cues, habit trackers",
      instagram: "motivation, real member wins, quick routines",
      linkedin: "wellness leadership, performance habits, team fitness",
      video: "fast tips, before-after progress, exercise demos",
    },
  },
  restaurant: {
    label: "Restaurants",
    vocabulary: [
      "chef's special",
      "house-made",
      "seasonal",
      "tasting menu",
      "reservation",
      "locally sourced",
      "signature dish",
      "pairing",
      "weekend special",
      "happy hour",
    ],
    emotionalTriggers: ["comfort", "indulgence", "celebration", "curiosity"],
    hooks: [
      "One bite and you're hooked",
      "The dish regulars keep coming back for",
      "What we're plating this weekend",
    ],
    ctas: [
      "Reserve your table",
      "Order the special",
      "Join us tonight",
      "Book a tasting",
    ],
    platformAngles: {
      pinterest: "menu highlights, plating inspiration, seasonal boards",
      instagram: "sensory moments, behind-the-scenes, limited-time drops",
      linkedin: "hospitality leadership, culinary craft, brand story",
      video: "sizzle shots, chef plating, first-bite reactions",
    },
  },
  coach: {
    label: "Coaches",
    vocabulary: [
      "clarity",
      "breakthrough",
      "framework",
      "accountability",
      "roadmap",
      "mindset shift",
      "momentum",
      "strategy",
      "milestone",
      "wins",
    ],
    emotionalTriggers: ["confidence", "relief", "progress", "focus"],
    hooks: [
      "The mindset shift that unlocks momentum",
      "What to do when you're stuck at the same level",
      "The simple framework that makes growth predictable",
    ],
    ctas: [
      "Book a clarity call",
      "Apply for coaching",
      "DM for the roadmap",
      "Start your next milestone",
    ],
    platformAngles: {
      pinterest: "frameworks, planning templates, goal roadmaps",
      instagram: "relatable stories, client wins, reflection prompts",
      linkedin: "authority teaching, leadership insights, case studies",
      video: "fast mindset shifts, quick wins, myth busts",
    },
  },
  general: {
    label: "General",
    vocabulary: [],
    emotionalTriggers: [],
    hooks: [],
    ctas: [],
    platformAngles: {
      pinterest: "searchable tips and checklists",
      instagram: "emotional connection and community",
      linkedin: "authority and education",
      video: "fast curiosity hooks",
    },
  },
};

export function resolveNiche(niche: string): NicheKey {
  const value = niche.toLowerCase();
  if (value.includes("realtor") || value.includes("real estate") || value.includes("broker") || value.includes("agent")) {
    return "realtor";
  }
  if (value.includes("gym") || value.includes("fitness") || value.includes("workout") || value.includes("trainer")) {
    return "gym";
  }
  if (value.includes("restaurant") || value.includes("cafe") || value.includes("bistro") || value.includes("diner") || value.includes("chef")) {
    return "restaurant";
  }
  if (value.includes("coach") || value.includes("consultant") || value.includes("mentor") || value.includes("strategist")) {
    return "coach";
  }
  return "general";
}

export function buildNicheLayer(nicheInput: string): string {
  const key = resolveNiche(nicheInput);
  const profile = nicheProfiles[key];

  if (key === "general") {
    return "Use niche-appropriate language and examples tied to the audience and topic.";
  }

  return [
    `Niche focus: ${profile.label}.`,
    `Vocabulary to weave in: ${profile.vocabulary.join(", ")}.`,
    `Emotional triggers: ${profile.emotionalTriggers.join(", ")}.`,
    `Hook angles: ${profile.hooks.join(" | ")}.`,
    `CTA styles: ${profile.ctas.join(" | ")}.`,
    `Platform angles: Pinterest (${profile.platformAngles.pinterest}); Instagram (${profile.platformAngles.instagram}); LinkedIn (${profile.platformAngles.linkedin}); Video (${profile.platformAngles.video}).`,
  ].join("\n");
}

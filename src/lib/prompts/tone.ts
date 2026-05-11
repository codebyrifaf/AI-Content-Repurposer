const toneProfiles: Record<string, string> = {
  confident:
    "Confident tone: assertive, clear, and decisive. Avoid hedging language.",
  warm: "Warm tone: empathetic, supportive, and encouraging.",
  bold: "Bold tone: direct, punchy, and high-energy. Keep sentences short.",
  friendly:
    "Friendly tone: approachable, conversational, and upbeat. Sound human and inviting.",
  minimal: "Minimal tone: tight, clean, and no fluff. Prioritize clarity.",
  luxury:
    "Luxury tone: refined, premium, and elegant. Use elevated but simple language.",
};

function normalizeTone(tone: string) {
  const value = tone.trim().toLowerCase();
  if (value.includes("confident")) return "confident";
  if (value.includes("warm")) return "warm";
  if (value.includes("bold")) return "bold";
  if (value.includes("friendly")) return "friendly";
  if (value.includes("minimal")) return "minimal";
  if (value.includes("luxury")) return "luxury";
  return "confident";
}

export function buildToneLayer(tone: string): string {
  const key = normalizeTone(tone);
  return toneProfiles[key];
}

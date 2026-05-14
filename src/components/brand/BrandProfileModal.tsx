"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import type { BrandProfile, BrandProfileInput } from "@/types/brand-profile";

const fieldHintClass = "text-xs text-muted";

const toneSuggestions = [
  "Confident + practical",
  "Warm + supportive",
  "Premium + minimal",
];

const ctaSuggestions = [
  "Invite to DM",
  "Book a call",
  "Claim free consult",
];

const platformSuggestions = [
  "Instagram, TikTok",
  "LinkedIn, Pinterest",
  "Instagram, YouTube",
];

function listToText(values: string[] | null | undefined) {
  if (!values || values.length === 0) {
    return "";
  }
  return values.join(", ");
}

function parseList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

type BrandProfileModalProps = {
  open: boolean;
  initialProfile?: BrandProfile | null;
  onClose: () => void;
  onSave: (payload: BrandProfileInput) => Promise<void>;
};

export function BrandProfileModal({
  open,
  initialProfile,
  onClose,
  onSave,
}: BrandProfileModalProps) {
  const [name, setName] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [offer, setOffer] = useState("");
  const [toneOfVoice, setToneOfVoice] = useState("");
  const [ctaStyle, setCtaStyle] = useState("");
  const [platformFocus, setPlatformFocus] = useState("");
  const [brandKeywords, setBrandKeywords] = useState("");
  const [forbiddenPhrases, setForbiddenPhrases] = useState("");
  const [writingStyle, setWritingStyle] = useState("");
  const [postingGoals, setPostingGoals] = useState("");
  const [saving, setSaving] = useState(false);

  const isEdit = Boolean(initialProfile);

  useEffect(() => {
    if (!open) {
      return;
    }
    setName(initialProfile?.name ?? "");
    setBusinessDescription(initialProfile?.businessDescription ?? "");
    setTargetAudience(initialProfile?.targetAudience ?? "");
    setOffer(initialProfile?.offer ?? "");
    setToneOfVoice(initialProfile?.toneOfVoice ?? "");
    setCtaStyle(initialProfile?.ctaStyle ?? "");
    setPlatformFocus(listToText(initialProfile?.platformFocus));
    setBrandKeywords(listToText(initialProfile?.brandKeywords));
    setForbiddenPhrases(listToText(initialProfile?.forbiddenPhrases));
    setWritingStyle(initialProfile?.writingStyle ?? "");
    setPostingGoals(initialProfile?.postingGoals ?? "");
  }, [open, initialProfile]);

  const isValid = useMemo(() => name.trim().length > 0 && !saving, [name, saving]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValid) {
      return;
    }
    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        businessDescription: businessDescription.trim() || null,
        targetAudience: targetAudience.trim() || null,
        offer: offer.trim() || null,
        toneOfVoice: toneOfVoice.trim() || null,
        ctaStyle: ctaStyle.trim() || null,
        platformFocus: parseList(platformFocus),
        brandKeywords: parseList(brandKeywords),
        forbiddenPhrases: parseList(forbiddenPhrases),
        writingStyle: writingStyle.trim() || null,
        postingGoals: postingGoals.trim() || null,
      });
      onClose();
    } catch {
      // Error feedback is handled by parent toast notifications.
    } finally {
      setSaving(false);
    }
  };

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto px-6 py-8 sm:py-10">
      <div
        className="absolute inset-0 bg-slate-950/70 backdrop-blur"
        aria-hidden
        onClick={onClose}
      />
      <div className="relative flex min-h-full items-start justify-center">
        <Card className="w-full max-w-4xl space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xs uppercase tracking-[0.3em] text-muted">
                  Brand voice
                </p>
                <Badge className="bg-surface-2 text-foreground">
                  {isEdit ? "Editing profile" : "New profile"}
                </Badge>
              </div>
              <h3 className="mt-2 font-display text-2xl text-foreground">
                {isEdit ? "Edit brand profile" : "Create brand profile"}
              </h3>
              <p className="mt-2 text-sm text-muted">
                Save reusable brand intelligence for personalized, consistent AI output.
              </p>
            </div>
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
          </div>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm text-muted">
                <span>Brand name</span>
                <Input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Northline Realty"
                />
                <span className={fieldHintClass}>Required. Used as a voice anchor.</span>
              </label>
              <label className="space-y-2 text-sm text-muted">
                <span>Offer / service</span>
                <Input
                  value={offer}
                  onChange={(event) => setOffer(event.target.value)}
                  placeholder="Luxury condo listings + buyer advisory"
                />
                <span className={fieldHintClass}>What you sell and how you help.</span>
              </label>

              <label className="space-y-2 text-sm text-muted md:col-span-2">
                <span>Business description</span>
                <Textarea
                  rows={3}
                  value={businessDescription}
                  onChange={(event) => setBusinessDescription(event.target.value)}
                  placeholder="We help first-time buyers confidently purchase downtown homes."
                />
                <span className={fieldHintClass}>
                  Example: &quot;We help local owners get predictable leads in 30 days.&quot;
                </span>
              </label>

              <label className="space-y-2 text-sm text-muted">
                <span>Target audience</span>
                <Input
                  value={targetAudience}
                  onChange={(event) => setTargetAudience(event.target.value)}
                  placeholder="First-time condo buyers with busy schedules"
                />
                <span className={fieldHintClass}>
                  Example: coaches, realtors, gym owners, or local service operators.
                </span>
              </label>
              <label className="space-y-2 text-sm text-muted">
                <span>Tone of voice</span>
                <Input
                  value={toneOfVoice}
                  onChange={(event) => setToneOfVoice(event.target.value)}
                  placeholder="Confident, friendly, no fluff"
                />
                <span className={fieldHintClass}>
                  Try: {toneSuggestions.join(" / ")}
                </span>
              </label>

              <label className="space-y-2 text-sm text-muted">
                <span>CTA style</span>
                <Input
                  value={ctaStyle}
                  onChange={(event) => setCtaStyle(event.target.value)}
                  placeholder="Invite readers to book a private tour"
                />
                <span className={fieldHintClass}>
                  Try: {ctaSuggestions.join(" / ")}
                </span>
              </label>
              <label className="space-y-2 text-sm text-muted">
                <span>Platform focus</span>
                <Input
                  value={platformFocus}
                  onChange={(event) => setPlatformFocus(event.target.value)}
                  placeholder="Instagram, LinkedIn, Pinterest"
                />
                <span className={fieldHintClass}>
                  Comma-separated. Example: {platformSuggestions.join(" / ")}
                </span>
              </label>

              <label className="space-y-2 text-sm text-muted">
                <span>Brand keywords</span>
                <Input
                  value={brandKeywords}
                  onChange={(event) => setBrandKeywords(event.target.value)}
                  placeholder="clarity, trust, local expertise"
                />
                <span className={fieldHintClass}>Words to naturally weave into outputs.</span>
              </label>
              <label className="space-y-2 text-sm text-muted">
                <span>Forbidden phrases</span>
                <Input
                  value={forbiddenPhrases}
                  onChange={(event) => setForbiddenPhrases(event.target.value)}
                  placeholder="game changer, unlock, revolutionize"
                />
                <span className={fieldHintClass}>
                  Phrases the AI must never use. Example: &quot;AI-powered magic&quot;.
                </span>
              </label>

              <label className="space-y-2 text-sm text-muted md:col-span-2">
                <span>Writing style</span>
                <Textarea
                  rows={3}
                  value={writingStyle}
                  onChange={(event) => setWritingStyle(event.target.value)}
                  placeholder="Short paragraphs, concrete examples, direct language."
                />
              </label>
              <label className="space-y-2 text-sm text-muted md:col-span-2">
                <span>Posting goals</span>
                <Textarea
                  rows={3}
                  value={postingGoals}
                  onChange={(event) => setPostingGoals(event.target.value)}
                  placeholder="Book 5 calls/month, improve saves, and grow local authority."
                />
                <span className={fieldHintClass}>
                  Example goals: build trust, generate leads, announce update.
                </span>
              </label>
            </div>

            <div className="rounded-2xl border border-border/60 bg-surface/70 p-4 text-sm text-muted">
              Better inputs create better outputs. Focus on audience pain points, offer clarity,
              CTA behavior, and words to avoid.
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-xs text-muted">
                You can switch active profiles anytime before generating.
              </p>
              <div className="flex items-center gap-3">
                <Button variant="secondary" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!isValid}>
                  {saving ? "Saving..." : isEdit ? "Save profile" : "Create profile"}
                </Button>
              </div>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

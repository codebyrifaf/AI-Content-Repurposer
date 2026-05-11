import type { Metadata } from "next";
import { CTA } from "@/components/landing/CTA";
import { DemoPreview } from "@/components/landing/DemoPreview";
import { Features } from "@/components/landing/Features";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Navbar } from "@/components/landing/Navbar";
import { OutputSamples } from "@/components/landing/OutputSamples";
import { PlatformStrip } from "@/components/landing/PlatformStrip";
import { Pricing } from "@/components/landing/Pricing";
import { SocialProof } from "@/components/landing/SocialProof";
import { WorkflowComparison } from "@/components/landing/WorkflowComparison";

export const metadata: Metadata = {
  title: "ContentFlow | AI Content Generator for Social Media",
  description:
    "Generate Pinterest titles, AI captions, LinkedIn posts, and video hooks in seconds. ContentFlow is a social media content AI that replaces the daily workload.",
  keywords: [
    "AI content generator",
    "social media content AI",
    "Pinterest content generator",
    "AI caption generator",
    "LinkedIn post generator",
    "video hook generator",
  ],
  openGraph: {
    title: "ContentFlow | AI Content Generator for Social Media",
    description:
      "Generate Pinterest titles, AI captions, LinkedIn posts, and video hooks in seconds.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ContentFlow | AI Content Generator for Social Media",
    description:
      "Generate Pinterest titles, AI captions, LinkedIn posts, and video hooks in seconds.",
  },
};

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <PlatformStrip />
        <HowItWorks />
        <Features />
        <SocialProof />
        <OutputSamples />
        <DemoPreview />
        <WorkflowComparison />
        <Pricing />
        <CTA />
      </main>
      <footer className="border-t border-border/60 bg-surface/40">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-10 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="font-display text-base text-foreground">ContentFlow</span>
            <span className="text-muted">AI Content Repurposer</span>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-muted">
            <span>Privacy</span>
            <span>Terms</span>
            <span>Support</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

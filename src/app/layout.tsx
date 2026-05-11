import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import { ToastProvider } from "@/components/ui/Toast";
import "./globals.css";

const bodyFont = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const displayFont = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ContentFlow | AI Content Repurposer",
  description:
    "Turn one idea into multi-platform content with AI-powered workflows.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${bodyFont.variable} ${displayFont.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        <div className="relative flex min-h-screen flex-col overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,#1b2434,transparent_55%)]" />
          <div className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,#2ad4ff,transparent_60%)] opacity-20 blur-3xl animate-float-slow" />
          <div className="pointer-events-none absolute bottom-[-140px] right-[-120px] h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle,#55ffb5,transparent_60%)] opacity-20 blur-3xl" />
          <div className="relative z-10 flex min-h-screen flex-col">
            <ToastProvider>{children}</ToastProvider>
          </div>
        </div>
      </body>
    </html>
  );
}

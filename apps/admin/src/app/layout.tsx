import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ContentFlow Owner Admin",
  description: "Owner analytics and operations panel",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-full bg-background text-foreground">
        <div className="relative min-h-screen overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,#1b2434,transparent_55%)]" />
          <div className="relative z-10">{children}</div>
        </div>
      </body>
    </html>
  );
}

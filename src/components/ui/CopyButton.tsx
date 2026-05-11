"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

type CopyButtonProps = {
  text: string;
  label?: string;
};

export function CopyButton({ text, label = "Copy" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) {
      return;
    }
    const timer = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const handleCopy = async () => {
    if (!text) {
      return;
    }
    await navigator.clipboard.writeText(text);
    setCopied(true);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleCopy}
      className="text-xs"
    >
      {copied ? "Copied" : label}
    </Button>
  );
}

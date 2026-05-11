"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { signInWithPassword } from "@/lib/supabase/auth";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const router = useRouter();
  const { pushToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [redirectPath, setRedirectPath] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const params = new URLSearchParams(window.location.search);
    setRedirectPath(params.get("redirect"));
  }, []);

  const isValid =
    emailPattern.test(email.trim()) && password.trim().length >= 8;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!isValid) {
      const message = "Enter a valid email and a password of 8+ characters.";
      setError(message);
      pushToast({ title: "Check your details", description: message, tone: "error" });
      return;
    }

    setLoading(true);
    const supabase = createBrowserSupabaseClient();
    const { error: signInError } = await signInWithPassword(
      supabase,
      email.trim(),
      password
    );

    if (signInError) {
      setError(signInError.message);
      pushToast({
        title: "Login failed",
        description: signInError.message,
        tone: "error",
      });
      setLoading(false);
      return;
    }

    pushToast({
      title: "Welcome back",
      description: "You're signed in.",
      tone: "success",
    });
    router.push(
      redirectPath && redirectPath.startsWith("/") ? redirectPath : "/dashboard"
    );
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-16">
      <AuthCard
        title="Welcome back"
        subtitle="Log in to keep your content workflows moving."
        footer={
          <span>
            New here?{" "}
            <Link href="/signup" className="text-foreground">
              Create an account
            </Link>
          </span>
        }
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="space-y-2 text-sm text-muted">
            <span>Email</span>
            <Input
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label className="space-y-2 text-sm text-muted">
            <span>Password</span>
            <Input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          <Button type="submit" size="lg" className="w-full" disabled={!isValid || loading}>
            {loading ? "Logging in..." : "Log in"}
          </Button>
          {error ? (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">
              {error}
            </div>
          ) : null}
        </form>
      </AuthCard>
    </div>
  );
}

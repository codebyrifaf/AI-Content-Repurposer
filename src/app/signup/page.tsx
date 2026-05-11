"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { signUpWithPassword } from "@/lib/supabase/auth";
import { upsertProfile } from "@/lib/supabase/queries";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignupPage() {
  const router = useRouter();
  const { pushToast } = useToast();
  const [fullName, setFullName] = useState("");
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
    fullName.trim().length > 1 &&
    emailPattern.test(email.trim()) &&
    password.trim().length >= 8;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!isValid) {
      const message =
        "Add your name, a valid email, and a password of 8+ characters.";
      setError(message);
      pushToast({ title: "Check your details", description: message, tone: "error" });
      return;
    }

    setLoading(true);
    const supabase = createBrowserSupabaseClient();
    const { data, error: signUpError } = await signUpWithPassword(supabase, {
      email: email.trim(),
      password,
      fullName: fullName.trim(),
      redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
    });

    if (signUpError) {
      setError(signUpError.message);
      pushToast({
        title: "Signup failed",
        description: signUpError.message,
        tone: "error",
      });
      setLoading(false);
      return;
    }

    if (data.user) {
      try {
        await upsertProfile(supabase, data.user.id, fullName.trim());
      } catch (profileError) {
        const message =
          profileError instanceof Error
            ? profileError.message
            : "Profile setup failed.";
        pushToast({ title: "Profile setup", description: message, tone: "info" });
      }
    }

    if (!data.session) {
      pushToast({
        title: "Confirm your email",
        description: "Check your inbox to finish creating your account.",
        tone: "info",
      });
      setLoading(false);
      return;
    }

    pushToast({
      title: "Account created",
      description: "Welcome to ContentFlow.",
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
        title="Create your account"
        subtitle="Start building structured content flows in minutes."
        footer={
          <span>
            Already have an account?{" "}
            <Link href="/login" className="text-foreground">
              Log in
            </Link>
          </span>
        }
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="space-y-2 text-sm text-muted">
            <span>Name</span>
            <Input
              type="text"
              placeholder="Alex Rivera"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
            />
          </label>
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
              placeholder="Create a password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          <Button type="submit" size="lg" className="w-full" disabled={!isValid || loading}>
            {loading ? "Creating account..." : "Create account"}
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

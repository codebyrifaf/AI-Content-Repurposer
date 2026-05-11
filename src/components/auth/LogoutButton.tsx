"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { signOut } from "@/lib/supabase/auth";

export function LogoutButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { pushToast } = useToast();

  const handleLogout = async () => {
    if (loading) {
      return;
    }
    setLoading(true);
    const supabase = createBrowserSupabaseClient();
    const { error } = await signOut(supabase);

    if (error) {
      pushToast({
        title: "Sign out failed",
        description: error.message,
        tone: "error",
      });
      setLoading(false);
      return;
    }

    pushToast({
      title: "Signed out",
      description: "You have been logged out.",
      tone: "success",
    });
    router.push("/login");
    router.refresh();
  };

  return (
    <Button variant="ghost" onClick={handleLogout} disabled={loading}>
      {loading ? "Signing out..." : "Logout"}
    </Button>
  );
}

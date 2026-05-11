export { createBrowserSupabaseClient } from "@/lib/supabase/client";
export { createServerSupabaseClient } from "@/lib/supabase/server";
export { createMiddlewareSupabaseClient } from "@/lib/supabase/middleware";
export { getServerSession, getServerUser } from "@/lib/supabase/session";
export { signInWithPassword, signOut, signUpWithPassword } from "@/lib/supabase/auth";
export {
  createBrandProfile,
  deleteBrandProfile,
  fetchBrandProfileById,
  fetchBrandProfiles,
  fetchGenerations,
  insertGeneration,
  updateBrandProfile,
  upsertProfile,
} from "@/lib/supabase/queries";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

type AuthClient = Pick<SupabaseClient<Database>, "auth">;

type SignUpPayload = {
  email: string;
  password: string;
  fullName: string;
  redirectTo: string;
};

export function signInWithPassword(
  client: AuthClient,
  email: string,
  password: string
) {
  return client.auth.signInWithPassword({ email, password });
}

export function signUpWithPassword(client: AuthClient, payload: SignUpPayload) {
  return client.auth.signUp({
    email: payload.email,
    password: payload.password,
    options: {
      data: { full_name: payload.fullName },
      emailRedirectTo: payload.redirectTo,
    },
  });
}

export function signOut(client: AuthClient) {
  return client.auth.signOut();
}

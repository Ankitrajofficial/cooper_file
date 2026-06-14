import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseConfig } from "@/lib/supabase/config";

export async function createSupabaseServerClient(signal?: AbortSignal) {
  const { url, anonKey } = getSupabaseConfig();
  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    // Attach an abort signal so callers can cap how long auth network calls
    // block. Without it, an unreachable Supabase host makes supabase-js retry
    // for ~25s, hanging the render and leaking errors to the dev overlay.
    global: signal
      ? {
          fetch: (input: RequestInfo | URL, init?: RequestInit) =>
            fetch(input, { ...init, signal }),
        }
      : undefined,
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components can read auth cookies but cannot always write them.
        }
      },
    },
  });
}

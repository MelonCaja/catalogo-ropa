import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

import { supabaseEnv } from "@/lib/supabase/env";
import type { Database } from "@/lib/types";

/**
 * Cliente de Supabase para Server Components, Server Actions y Route Handlers.
 * En Next 15 `cookies()` es asíncrono, por eso la función es async.
 */
export async function createClient() {
  const { url, anonKey } = supabaseEnv();
  const cookieStore = await cookies();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Los Server Components no pueden escribir cookies:
          // el middleware ya refresca la sesión, así que se puede ignorar.
        }
      },
    },
  });
}

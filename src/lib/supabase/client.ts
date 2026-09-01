"use client";

import { createBrowserClient } from "@supabase/ssr";

import { supabaseEnv } from "@/lib/supabase/env";
import type { Database } from "@/lib/types";

/** Cliente de Supabase para componentes que corren en el navegador. */
export function createClient() {
  const { url, anonKey } = supabaseEnv();
  return createBrowserClient<Database>(url, anonKey);
}

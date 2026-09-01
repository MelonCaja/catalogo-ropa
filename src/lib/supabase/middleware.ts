import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

import { supabaseEnv } from "@/lib/supabase/env";
import type { Database } from "@/lib/types";

/**
 * Refresca la sesión en cada request y protege /admin.
 * Devuelve siempre la respuesta que lleva las cookies actualizadas.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const { url, anonKey } = supabaseEnv();

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, search } = request.nextUrl;

  if (!user && pathname.startsWith("/admin")) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "";
    loginUrl.searchParams.set("redirectTo", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (user && pathname === "/login") {
    const adminUrl = request.nextUrl.clone();
    adminUrl.pathname = "/admin";
    adminUrl.search = "";
    return NextResponse.redirect(adminUrl);
  }

  return response;
}

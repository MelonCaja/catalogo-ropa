import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

import { supabaseEnv } from "@/lib/supabase/env";
import type { Database } from "@/lib/types";

/** Rutas privadas: todo lo que cuelga de /admin. */
function isProtected(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

/**
 * Se ejecuta en el Edge en cada request que pase el matcher.
 *
 * 1. Refresca la sesión de Supabase leyendo/escribiendo cookies.
 * 2. Valida el usuario contra el backend de Supabase con `getUser()`
 *    (verifica la firma del JWT; NO se usa `getSession()`, que solo lee la cookie).
 * 3. Bloquea /admin sin sesión -> 307 a /login?redirectedFrom=...
 * 4. Saca de /login a quien ya tiene sesión -> 307 a /admin
 *
 * Siempre devuelve la respuesta que transporta las cookies actualizadas.
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
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (!user && isProtected(pathname)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "";
    loginUrl.searchParams.set("redirectedFrom", pathname);
    return NextResponse.redirect(loginUrl); // 307 por defecto
  }

  if (user && pathname === "/login") {
    const adminUrl = request.nextUrl.clone();
    adminUrl.pathname = "/admin";
    adminUrl.search = "";
    return NextResponse.redirect(adminUrl); // 307 por defecto
  }

  return response;
}

import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

/**
 * Cierra la sesión: revoca el token en Supabase y borra las cookies de auth
 * (el cliente SSR las expira vía `setAll` sobre el cookie store del handler).
 * Después redirige a /login con 303 (POST -> GET).
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
}

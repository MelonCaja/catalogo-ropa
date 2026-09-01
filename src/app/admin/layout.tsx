import Link from "next/link";
import type { Metadata } from "next";

import { Button } from "@/components/ui/button";
import { STORE_NAME } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Panel" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-paper-line">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-baseline gap-3">
            <Link href="/admin" className="wordmark">
              {STORE_NAME}
            </Link>
            <span className="text-xs text-ink-faint">Panel</span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/" className="text-xs text-ink-muted transition-colors hover:text-ink">
              Ver catálogo
            </Link>
            <form action="/auth/signout" method="post">
              <Button type="submit" variant="ghost" size="sm" className="px-0 text-xs">
                Cerrar sesión
              </Button>
            </form>
          </div>
        </div>
        {user?.email ? (
          <div className="mx-auto max-w-5xl px-4 pb-2 text-xs text-ink-faint sm:px-6">
            Sesión de {user.email}
          </div>
        ) : null}
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}

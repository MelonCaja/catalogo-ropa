import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";

import { LoginForm } from "@/components/login-form";
import { STORE_NAME } from "@/lib/constants";

export const metadata: Metadata = { title: "Iniciar sesión" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const { redirectTo } = await searchParams;
  const target = redirectTo?.startsWith("/admin") ? redirectTo : "/admin";

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <Link href="/" className="wordmark block text-center">
          {STORE_NAME}
        </Link>

        <h1 className="mt-10 text-xl">Entrar al panel</h1>
        <p className="mt-1.5 text-sm text-ink-muted">
          Solo para administrar el catálogo. Los visitantes no necesitan cuenta.
        </p>

        <div className="mt-6">
          <LoginForm redirectTo={target} />
        </div>

        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-1.5 text-xs text-ink-faint transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
          Volver al catálogo
        </Link>
      </div>
    </main>
  );
}

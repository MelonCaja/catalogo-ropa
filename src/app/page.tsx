import Link from "next/link";
import { Lock } from "lucide-react";

import { Catalog } from "@/components/catalog";
import { STORE_NAME } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";

export const revalidate = 0;

export default async function HomePage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  const products = (data ?? []) as Product[];

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 border-b border-paper-line bg-paper/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="wordmark">
            {STORE_NAME}
          </Link>
          <Link
            href="/login"
            className="flex items-center gap-1.5 font-sans text-[0.62rem] uppercase tracking-meta text-ink-faint transition-colors hover:text-ink"
          >
            <Lock className="h-3.5 w-3.5" strokeWidth={1.5} />
            Administrar
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-4 pb-12 pt-14 sm:px-6 sm:pt-20">
          <h1 className="max-w-[16ch] text-[2.4rem] leading-[1.1] sm:text-[3.4rem]">
            Prendas de segunda mano, elegidas de a una.
          </h1>
          <p className="mt-5 max-w-[54ch] font-serif text-[1.1rem] leading-relaxed text-ink-muted">
            Cada pieza está fotografiada tal como llega a tus manos. Si te gusta algo, escríbeme por
            WhatsApp o Instagram y coordinamos la entrega el mismo día.
          </p>
        </section>

        {error ? (
          <p className="mx-auto max-w-6xl px-4 pb-24 text-sm text-ink-muted sm:px-6">
            El catálogo no cargó. Revisa la conexión con Supabase y vuelve a intentar.
          </p>
        ) : (
          <Catalog products={products} />
        )}
      </main>

      <footer className="border-t border-paper-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-1.5 px-4 py-10 font-sans text-[0.62rem] uppercase tracking-meta text-ink-faint sm:px-6">
          <span>{STORE_NAME}</span>
          <span>Entregas coordinadas por WhatsApp e Instagram. Sin envíos ni pagos en línea.</span>
        </div>
      </footer>
    </div>
  );
}

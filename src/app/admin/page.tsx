import Link from "next/link";
import { Plus } from "lucide-react";

import { AdminTable } from "@/components/admin-table";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";

export const revalidate = 0;

export default async function AdminPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  const products = (data ?? []) as Product[];

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl">Prendas</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {products.length} {products.length === 1 ? "prenda publicada" : "prendas publicadas"}
          </p>
        </div>

        <Link
          href="/admin/nuevo"
          className="inline-flex h-10 items-center gap-2 bg-ink px-4 text-sm font-medium text-paper transition-colors hover:bg-black"
        >
          <Plus className="h-4 w-4" strokeWidth={1.5} />
          Publicar prenda
        </Link>
      </div>

      <div className="mt-8">
        {error ? (
          <p className="border border-paper-line p-6 text-sm text-ink-muted">
            No se pudieron cargar las prendas: {error.message}
          </p>
        ) : (
          <AdminTable products={products} />
        )}
      </div>
    </>
  );
}

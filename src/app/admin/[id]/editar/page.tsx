import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";

import { ProductForm } from "@/components/product-form";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";

export const metadata: Metadata = { title: "Editar prenda" };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createClient();
  const { data } = await supabase.from("products").select("*").eq("id", id).maybeSingle();

  if (!data) notFound();
  const product = data as Product;

  return (
    <>
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-xs text-ink-faint transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
        Volver al panel
      </Link>

      <h1 className="mt-4 text-xl">Editar prenda</h1>
      <p className="mt-1 text-sm text-ink-muted">{product.title}</p>

      <div className="mt-8">
        <ProductForm product={product} />
      </div>
    </>
  );
}

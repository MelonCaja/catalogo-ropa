import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";

import { ProductForm } from "@/components/product-form";

export const metadata: Metadata = { title: "Nueva prenda" };

export default function NewProductPage() {
  return (
    <>
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-xs text-ink-faint transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
        Volver al panel
      </Link>

      <h1 className="mt-4 text-xl">Publicar prenda</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Aparecerá en el catálogo apenas la guardes.
      </p>

      <div className="mt-8">
        <ProductForm />
      </div>
    </>
  );
}

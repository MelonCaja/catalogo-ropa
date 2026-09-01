"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Search, Trash2 } from "lucide-react";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { deleteProduct, updateProductStatus } from "@/app/admin/actions";
import { STATUS_LABEL, STATUSES } from "@/lib/constants";
import { formatDate, formatPrice, productSku } from "@/lib/utils";
import type { Product, ProductStatus } from "@/lib/types";

export function AdminTable({ products }: { products: Product[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = React.useState<string | null>(null);
  const [toDelete, setToDelete] = React.useState<Product | null>(null);
  const [deleting, setDeleting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [query, setQuery] = React.useState("");

  const normalizedQuery = query.trim().toLowerCase();
  const filtered = React.useMemo(() => {
    if (!normalizedQuery) return products;
    return products.filter((product) => {
      const haystack = [productSku(product), product.title, product.category ?? ""]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [products, normalizedQuery]);

  async function onStatusChange(product: Product, status: ProductStatus) {
    setPendingId(product.id);
    setError(null);
    const result = await updateProductStatus(product.id, status);
    setPendingId(null);
    if (!result.ok) {
      setError(result.message ?? "No se pudo cambiar el estado.");
      return;
    }
    router.refresh();
  }

  async function onConfirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    setError(null);
    const result = await deleteProduct(toDelete.id);
    setDeleting(false);
    setToDelete(null);
    if (!result.ok) {
      setError(result.message ?? "No se pudo eliminar la prenda.");
      return;
    }
    router.refresh();
  }

  if (products.length === 0) {
    return (
      <div className="border border-dashed border-paper-line px-6 py-16 text-center">
        <p className="text-sm text-ink-muted">Aún no publicas ninguna prenda.</p>
        <Link href="/admin/nuevo" className="mt-2 inline-block text-sm underline underline-offset-4">
          Publicar la primera
        </Link>
      </div>
    );
  }

  return (
    <>
      {error ? (
        <p role="alert" className="mb-4 border border-paper-line px-3 py-2 text-sm">
          {error}
        </p>
      ) : null}

      <div className="relative mb-4">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint"
          strokeWidth={1.5}
        />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar por SKU, título o categoría"
          aria-label="Buscar prendas"
          className="h-10 w-full border border-paper-line bg-paper pl-9 pr-3 text-sm text-ink placeholder:text-ink-faint focus:border-ink focus:outline-none"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="border border-dashed border-paper-line px-6 py-12 text-center text-sm text-ink-muted">
          Ninguna prenda coincide con “{query.trim()}”.
        </p>
      ) : (
        <>
          <p className="meta mb-2 text-ink-faint">
            {filtered.length} {filtered.length === 1 ? "resultado" : "resultados"}
          </p>
          <ul className="divide-y divide-paper-line border-y border-paper-line">
            {filtered.map((product) => (
              <li
                key={product.id}
                className="flex flex-wrap items-center gap-4 py-4 data-[pending=true]:opacity-50"
                data-pending={pendingId === product.id}
              >
                <div className="relative h-20 w-16 shrink-0 overflow-hidden bg-paper-soft">
                  {product.images[0] ? (
                    <Image
                      src={product.images[0]}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : null}
                </div>

                <div className="min-w-[9rem] flex-1">
                  <p className="text-sm">{product.title}</p>
                  <p className="meta text-[0.6rem] text-ink-faint">{productSku(product)}</p>
                  <p className="text-xs text-ink-faint">
                    {product.category ?? "Sin categoría"} · Talla {product.size ?? "Única"}
                  </p>
                  <p className="text-xs text-ink-faint">Publicada el {formatDate(product.created_at)}</p>
                </div>

                <p className="w-24 text-sm">{formatPrice(product.price)}</p>

                <label className="sr-only" htmlFor={`status-${product.id}`}>
                  Estado de {product.title}
                </label>
                <select
                  id={`status-${product.id}`}
                  value={product.status}
                  disabled={pendingId === product.id}
                  onChange={(event) => onStatusChange(product, event.target.value as ProductStatus)}
                  className="h-9 border border-paper-line bg-paper px-2 text-xs text-ink focus:border-ink focus:outline-none"
                >
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {STATUS_LABEL[status]}
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-1">
                  <Link
                    href={`/admin/${product.id}/editar`}
                    aria-label={`Editar ${product.title}`}
                    className="flex h-9 w-9 items-center justify-center border border-paper-line transition-colors hover:border-ink"
                  >
                    <Pencil className="h-4 w-4" strokeWidth={1.5} />
                  </Link>
                  <button
                    type="button"
                    onClick={() => setToDelete(product)}
                    aria-label={`Eliminar ${product.title}`}
                    className="flex h-9 w-9 items-center justify-center border border-paper-line transition-colors hover:border-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Eliminar prenda"
        description={`Se borrará "${toDelete?.title ?? ""}" y sus fotos del almacenamiento. Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar prenda"
        pending={deleting}
        onConfirm={onConfirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}

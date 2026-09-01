"use client";

import Image from "next/image";

import { StatusBadge } from "@/components/ui/badge";
import { cn, formatPrice, productSku } from "@/lib/utils";
import type { Product } from "@/lib/types";

export function ProductCard({
  product,
  onOpen,
  priority = false,
}: {
  product: Product;
  onOpen: () => void;
  priority?: boolean;
}) {
  const cover = product.images[0];
  const isSold = product.status === "SOLD";
  const isReserved = product.status === "RESERVED";

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group block w-full text-left"
      aria-label={`Ver ${product.title}`}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-paper-soft">
        {cover ? (
          <Image
            src={cover}
            alt={product.title}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 33vw, 50vw"
            className={cn(
              "object-cover transition-all duration-700 ease-out group-hover:scale-[1.04]",
              (isSold || isReserved) && "opacity-70",
            )}
          />
        ) : (
          <div className="meta flex h-full items-center justify-center text-ink-faint">Sin foto</div>
        )}

        {product.status !== "AVAILABLE" ? (
          <span className="absolute left-3 top-3 bg-paper/85 px-2 py-1 backdrop-blur-sm">
            <StatusBadge status={product.status} compact />
          </span>
        ) : null}
      </div>

      <div className="mt-3.5 space-y-1.5">
        <h3 className="font-serif text-[1.15rem] font-normal leading-tight text-ink">
          {product.title}
        </h3>
        <div className="meta flex items-center gap-2 text-ink-muted">
          <span>{formatPrice(product.price)}</span>
          {product.size ? (
            <>
              <span aria-hidden className="text-ink-faint">·</span>
              <span>Talla {product.size}</span>
            </>
          ) : null}
        </div>
        <p className="meta text-[0.6rem] text-ink-faint">{productSku(product)}</p>
      </div>
    </button>
  );
}

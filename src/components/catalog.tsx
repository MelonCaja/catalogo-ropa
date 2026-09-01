"use client";

import * as React from "react";

import { ProductCard } from "@/components/product-card";
import { ProductDetail } from "@/components/product-detail";
import { CATEGORIES, SIZES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types";

type CategoryFilter = (typeof CATEGORIES)[number] | "Todo";
type SizeFilter = (typeof SIZES)[number] | "Todas";
type AvailabilityFilter = "all" | "available";

function Pill({
  active,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        "shrink-0 border px-3.5 py-1.5 font-sans text-[0.62rem] uppercase tracking-meta transition-colors",
        active
          ? "border-ink bg-ink text-paper"
          : "border-paper-line text-ink-muted hover:border-ink hover:text-ink",
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Catalog({ products }: { products: Product[] }) {
  const [category, setCategory] = React.useState<CategoryFilter>("Todo");
  const [size, setSize] = React.useState<SizeFilter>("Todas");
  const [availability, setAvailability] = React.useState<AvailabilityFilter>("all");
  const [selected, setSelected] = React.useState<Product | null>(null);

  const visible = React.useMemo(
    () =>
      products.filter((product) => {
        if (category !== "Todo" && product.category !== category) return false;
        if (size !== "Todas" && product.size !== size) return false;
        if (availability === "available" && product.status !== "AVAILABLE") return false;
        return true;
      }),
    [products, category, size, availability],
  );

  const hasFilters = category !== "Todo" || size !== "Todas" || availability !== "all";

  function resetFilters() {
    setCategory("Todo");
    setSize("Todas");
    setAvailability("all");
  }

  return (
    <>
      <div className="sticky top-14 z-20 border-y border-paper-line bg-paper/95 backdrop-blur">
        <div className="mx-auto max-w-6xl space-y-2 px-4 py-3 sm:px-6">
          <div
            className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            role="group"
            aria-label="Categorías"
          >
            <Pill active={category === "Todo"} onClick={() => setCategory("Todo")}>
              Todo
            </Pill>
            {CATEGORIES.map((item) => (
              <Pill key={item} active={category === item} onClick={() => setCategory(item)}>
                {item}
              </Pill>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <div className="flex items-center gap-2">
              <label htmlFor="size-filter" className="meta text-ink-faint">
                Talla
              </label>
              <select
                id="size-filter"
                value={size}
                onChange={(event) => setSize(event.target.value as SizeFilter)}
                className="h-8 border border-paper-line bg-paper px-2 font-sans text-[0.7rem] uppercase tracking-wide text-ink focus:border-ink focus:outline-none"
              >
                <option value="Todas">Todas</option>
                {SIZES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="availability-filter" className="meta text-ink-faint">
                Estado
              </label>
              <select
                id="availability-filter"
                value={availability}
                onChange={(event) => setAvailability(event.target.value as AvailabilityFilter)}
                className="h-8 border border-paper-line bg-paper px-2 font-sans text-[0.7rem] uppercase tracking-wide text-ink focus:border-ink focus:outline-none"
              >
                <option value="all">Todas las prendas</option>
                <option value="available">Solo disponibles</option>
              </select>
            </div>

            <span className="meta ml-auto text-ink-faint">
              {visible.length} {visible.length === 1 ? "prenda" : "prendas"}
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        {visible.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-sm text-ink-muted">
              {products.length === 0
                ? "Todavía no hay prendas publicadas. Vuelve pronto."
                : "Ninguna prenda coincide con estos filtros."}
            </p>
            {hasFilters && products.length > 0 ? (
              <button
                type="button"
                onClick={resetFilters}
                className="mt-3 text-sm underline underline-offset-4 hover:text-ink"
              >
                Ver todo el catálogo
              </button>
            ) : null}
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-8 sm:gap-y-16 lg:grid-cols-3">
            {visible.map((product, index) => (
              <li key={product.id}>
                <ProductCard product={product} priority={index < 3} onOpen={() => setSelected(product)} />
              </li>
            ))}
          </ul>
        )}
      </div>

      <ProductDetail product={selected} onClose={() => setSelected(null)} />
    </>
  );
}

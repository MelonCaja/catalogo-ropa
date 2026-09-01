"use client";

import * as React from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Instagram, Mail } from "lucide-react";

import { Modal } from "@/components/ui/modal";
import { StatusBadge } from "@/components/ui/badge";
import { STATUS_LABEL } from "@/lib/constants";
import {
  cn,
  contactEmailUrl,
  contactMessage,
  formatPrice,
  instagramUrl,
  productSku,
} from "@/lib/utils";
import type { Product } from "@/lib/types";

export function ProductDetail({
  product,
  onClose,
}: {
  product: Product | null;
  onClose: () => void;
}) {
  const [index, setIndex] = React.useState(0);
  const [igOpen, setIgOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    setIndex(0);
    setIgOpen(false);
    setCopied(false);
  }, [product?.id]);

  const total = product?.images.length ?? 0;

  const go = React.useCallback(
    (direction: 1 | -1) => {
      if (total === 0) return;
      setIndex((current) => (current + direction + total) % total);
    },
    [total],
  );

  React.useEffect(() => {
    if (!product) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowRight") go(1);
      if (event.key === "ArrowLeft") go(-1);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [product, go]);

  if (!product) return null;

  const available = product.status === "AVAILABLE";
  const sku = productSku(product);
  const igUrl = instagramUrl();
  const mailUrl = contactEmailUrl(product);
  const message = contactMessage(product);

  async function startInstagramFlow() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
    } catch {
      setCopied(false);
    }
    setIgOpen(true);
  }

  return (
    <Modal open onClose={onClose} label={product.title}>
      <div className="grid sm:grid-cols-2">
        <div className="relative aspect-[4/5] bg-paper-soft">
          {product.images[index] ? (
            <Image
              src={product.images[index]}
              alt={`${product.title} — foto ${index + 1} de ${total}`}
              fill
              sizes="(min-width: 640px) 50vw, 100vw"
              className="object-cover"
              priority
            />
          ) : (
            <div className="meta flex h-full items-center justify-center text-ink-faint">Sin foto</div>
          )}

          {total > 1 ? (
            <>
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Foto anterior"
                className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center bg-paper/85 transition-colors hover:bg-paper"
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Foto siguiente"
                className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center bg-paper/85 transition-colors hover:bg-paper"
              >
                <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
              </button>
              <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                {product.images.map((image, position) => (
                  <button
                    key={image}
                    type="button"
                    onClick={() => setIndex(position)}
                    aria-label={`Ver foto ${position + 1}`}
                    aria-current={position === index}
                    className={cn(
                      "h-1.5 w-1.5 rounded-full transition-colors",
                      position === index ? "bg-ink" : "bg-ink/30",
                    )}
                  />
                ))}
              </div>
            </>
          ) : null}
        </div>

        <div className="flex flex-col gap-6 p-6 sm:p-9">
          <div>
            <h2 className="font-serif text-[1.9rem] font-normal leading-tight">{product.title}</h2>
            <p className="meta mt-2 text-[0.8rem] text-ink">{formatPrice(product.price)}</p>
            <p className="meta mt-1 text-[0.62rem] text-ink-faint">Ref. {sku}</p>
          </div>

          <dl className="space-y-2.5 border-y border-paper-line py-4">
            <div className="flex justify-between gap-4">
              <dt className="meta text-ink-faint">Talla</dt>
              <dd className="meta text-ink">{product.size ?? "Única"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="meta text-ink-faint">Categoría</dt>
              <dd className="meta text-ink">{product.category ?? "Sin categoría"}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="meta text-ink-faint">Estado</dt>
              <dd>
                <StatusBadge status={product.status} compact />
              </dd>
            </div>
          </dl>

          {product.description ? (
            <p className="max-w-[55ch] whitespace-pre-line font-serif text-[1.05rem] leading-relaxed text-ink-muted">
              {product.description}
            </p>
          ) : null}

          <div className="mt-auto space-y-3 pt-2">
            {!available ? (
              <p className="meta border border-paper-line px-4 py-3 text-center normal-case tracking-normal text-ink-muted">
                Esta prenda está {STATUS_LABEL[product.status].toLowerCase()}. Escríbeme y te aviso si
                se libera.
              </p>
            ) : null}

            {igUrl ? (
              <button
                type="button"
                onClick={startInstagramFlow}
                className="flex h-12 w-full items-center justify-center gap-2.5 bg-ink px-6 font-sans text-[0.7rem] uppercase tracking-meta text-paper transition-colors hover:bg-black"
              >
                <Instagram className="h-4 w-4" strokeWidth={1.5} />
                Mensaje por Instagram
              </button>
            ) : null}

            {mailUrl ? (
              <a
                href={mailUrl}
                className="flex items-center justify-center gap-2 pt-1 font-sans text-[0.68rem] uppercase tracking-wide text-ink-faint underline-offset-4 transition-colors hover:text-ink hover:underline"
              >
                <Mail className="h-3.5 w-3.5" strokeWidth={1.5} />
                Consultar por correo
              </a>
            ) : null}
          </div>
        </div>
      </div>

      {igUrl ? (
        <Modal
          open={igOpen}
          onClose={() => setIgOpen(false)}
          label="Detalles copiados al portapapeles"
          className="sm:max-w-md"
        >
          <div className="flex flex-col gap-5 p-6 sm:p-8">
            <h3 className="font-serif text-[1.6rem] font-normal leading-tight">
              Detalles copiados al portapapeles
            </h3>
            <p className="text-sm leading-relaxed text-ink-muted">
              Hemos copiado la referencia de la prenda. Pega este mensaje directamente en el chat de
              Instagram para consultar disponibilidad.
            </p>

            <div className="border border-paper-line bg-paper-soft p-4 font-serif text-[1rem] leading-relaxed text-ink">
              {message}
            </div>

            {!copied ? (
              <p className="meta normal-case tracking-normal text-ink-faint">
                Si no se copió automáticamente, selecciona el texto de arriba y cópialo a mano.
              </p>
            ) : null}

            <div className="mt-1 flex flex-col gap-3">
              <a
                href={igUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIgOpen(false)}
                className="flex h-12 w-full items-center justify-center gap-2 bg-ink px-6 font-sans text-[0.7rem] uppercase tracking-meta text-paper transition-colors hover:bg-black"
              >
                Abrir chat de Instagram →
              </a>
              <button
                type="button"
                onClick={() => setIgOpen(false)}
                className="font-sans text-[0.68rem] uppercase tracking-wide text-ink-faint transition-colors hover:text-ink"
              >
                Volver
              </button>
            </div>
          </div>
        </Modal>
      ) : null}
    </Modal>
  );
}

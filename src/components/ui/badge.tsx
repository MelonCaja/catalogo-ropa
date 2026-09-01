import { cn } from "@/lib/utils";
import { STATUS_LABEL, STATUS_TAG } from "@/lib/constants";
import type { ProductStatus } from "@/lib/types";

const tone: Record<ProductStatus, string> = {
  AVAILABLE: "text-ink-muted",
  RESERVED: "text-ink",
  SOLD: "text-ink-faint",
};

/**
 * Etiqueta de estado tipográfica y discreta (RESERVADO / VENDIDO),
 * en sans geométrica con tracking espaciado.
 */
export function StatusBadge({
  status,
  className,
  compact = false,
}: {
  status: ProductStatus;
  className?: string;
  compact?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-sans text-[0.62rem] uppercase tracking-meta",
        tone[status],
        className,
      )}
    >
      {compact ? STATUS_TAG[status] : STATUS_LABEL[status]}
    </span>
  );
}

import type { ProductStatus } from "@/lib/types";

export const CATEGORIES = [
  "Tops",
  "Pantalones",
  "Vestidos",
  "Chaquetas",
  "Accesorios",
  "Calzado",
] as const;

export const SIZES = ["XS", "S", "M", "L", "XL", "Única"] as const;

export const STATUSES: ProductStatus[] = ["AVAILABLE", "RESERVED", "SOLD"];

export const STATUS_LABEL: Record<ProductStatus, string> = {
  AVAILABLE: "Disponible",
  RESERVED: "Reservada",
  SOLD: "Vendida",
};

/** Etiquetas tipográficas y discretas para el catálogo público. */
export const STATUS_TAG: Record<ProductStatus, string> = {
  AVAILABLE: "Disponible",
  RESERVED: "Reservado",
  SOLD: "Vendido",
};

export const STORAGE_BUCKET = "product-images";

export const STORE_NAME = process.env.NEXT_PUBLIC_STORE_NAME ?? "Segunda Vuelta";

/** Usuario de Instagram sin @ (ej. "segundavuelta"). */
export const INSTAGRAM_USER = (process.env.NEXT_PUBLIC_INSTAGRAM_USER ?? "").replace(/^@/, "");

/** Correo de contacto para consultas por email. */
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "";

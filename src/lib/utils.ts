import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { CONTACT_EMAIL, INSTAGRAM_USER, STORAGE_BUCKET } from "@/lib/constants";
import type { Product } from "@/lib/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formatea un entero de pesos chilenos: 32000 -> "$32.000" */
export function formatPrice(value: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

type SkuSource = Pick<Product, "id" | "category">;
type ContactSource = Pick<Product, "id" | "category" | "title" | "size" | "price">;

/**
 * SKU legible y corto de una prenda: 3 letras de la categoría + guion +
 * los primeros 4 caracteres del id. Ej: "TOP-9F2A", "VES-B301".
 * Es un valor derivado; no se guarda en la base de datos.
 */
export function productSku(product: SkuSource): string {
  const prefix = (product.category ?? "GEN")
    .normalize("NFD")
    .replace(/[^a-zA-Z]/g, "")
    .slice(0, 3)
    .toUpperCase()
    .padEnd(3, "X");
  const suffix = product.id.replace(/[^a-zA-Z0-9]/g, "").slice(0, 4).toUpperCase();
  return `${prefix}-${suffix}`;
}

/**
 * Mensaje prellenado para pegar en el chat de Instagram o enviar por correo.
 * Incluye el SKU para que el administrador identifique la prenda al instante.
 */
export function contactMessage(product: ContactSource) {
  const size = product.size?.trim() ? product.size : "sin talla";
  return `¡Hola! Me interesa la prenda: ${product.title} (SKU: ${productSku(product)}, Talla: ${size}, Precio: ${formatPrice(
    product.price,
  )})`;
}

/**
 * Enlace directo al chat de Instagram (ig.me/m/usuario). Si no hay usuario
 * configurado devuelve null para poder ocultar el botón.
 */
export function instagramUrl(): string | null {
  if (!INSTAGRAM_USER) return null;
  return `https://ig.me/m/${INSTAGRAM_USER}`;
}

/** mailto con asunto y cuerpo prellenados (incluye el SKU) para consultar por correo. */
export function contactEmailUrl(product: ContactSource): string | null {
  if (!CONTACT_EMAIL) return null;
  const subject = `Consulta ${productSku(product)}: ${product.title}`;
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
    contactMessage(product),
  )}`;
}

/**
 * Convierte una URL pública de Storage en la ruta interna del objeto.
 * https://<ref>.supabase.co/storage/v1/object/public/product-images/abc/1.jpg -> abc/1.jpg
 */
export function storagePathFromUrl(url: string): string | null {
  const marker = `/storage/v1/object/public/${STORAGE_BUCKET}/`;
  const index = url.indexOf(marker);
  if (index === -1) return null;
  const path = url.slice(index + marker.length).split("?")[0];
  return path ? decodeURIComponent(path) : null;
}

/** Nombre de archivo seguro y único para subir a Storage. */
export function buildImagePath(file: File) {
  const extension = (file.name.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return `${new Date().getFullYear()}/${unique}.${extension || "jpg"}`;
}

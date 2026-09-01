"use server";

import { revalidatePath } from "next/cache";

import { STORAGE_BUCKET, STATUSES } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import { storagePathFromUrl } from "@/lib/utils";
import type { ActionResult, ProductStatus } from "@/lib/types";

export interface ProductPayload {
  title: string;
  description: string;
  price: number;
  size: string;
  category: string;
  images: string[];
  status: ProductStatus;
}

function validate(payload: ProductPayload): string | null {
  if (!payload.title.trim()) return "El título es obligatorio.";
  if (!Number.isFinite(payload.price) || payload.price < 0) return "El precio debe ser un número mayor o igual a 0.";
  if (!STATUSES.includes(payload.status)) return "El estado no es válido.";
  if (payload.images.length === 0) return "Agrega al menos una foto de la prenda.";
  return null;
}

function clean(payload: ProductPayload) {
  return {
    title: payload.title.trim(),
    description: payload.description.trim() || null,
    price: Math.round(payload.price),
    size: payload.size.trim() || null,
    category: payload.category.trim() || null,
    images: payload.images,
    status: payload.status,
  };
}

function refresh() {
  revalidatePath("/");
  revalidatePath("/admin");
}

/** Borra objetos del bucket a partir de sus URLs públicas. Ignora las que no correspondan. */
async function removeImages(urls: string[]) {
  if (urls.length === 0) return;
  const supabase = await createClient();
  const paths = urls.map(storagePathFromUrl).filter((path): path is string => Boolean(path));
  if (paths.length > 0) {
    await supabase.storage.from(STORAGE_BUCKET).remove(paths);
  }
}

export async function createProduct(payload: ProductPayload): Promise<ActionResult> {
  const error = validate(payload);
  if (error) return { ok: false, message: error };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Tu sesión expiró. Vuelve a iniciar sesión." };

  const { error: insertError } = await supabase.from("products").insert(clean(payload));
  if (insertError) return { ok: false, message: `No se pudo guardar la prenda: ${insertError.message}` };

  refresh();
  return { ok: true };
}

export async function updateProduct(id: string, payload: ProductPayload): Promise<ActionResult> {
  const error = validate(payload);
  if (error) return { ok: false, message: error };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Tu sesión expiró. Vuelve a iniciar sesión." };

  const { data: current } = await supabase.from("products").select("images").eq("id", id).single();

  const { error: updateError } = await supabase.from("products").update(clean(payload)).eq("id", id);
  if (updateError) return { ok: false, message: `No se pudo actualizar la prenda: ${updateError.message}` };

  // Limpia del bucket las fotos que el admin quitó de la prenda.
  const orphans = (current?.images ?? []).filter((url) => !payload.images.includes(url));
  await removeImages(orphans);

  refresh();
  revalidatePath(`/admin/${id}/editar`);
  return { ok: true };
}

export async function updateProductStatus(id: string, status: ProductStatus): Promise<ActionResult> {
  if (!STATUSES.includes(status)) return { ok: false, message: "El estado no es válido." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Tu sesión expiró. Vuelve a iniciar sesión." };

  const { error } = await supabase.from("products").update({ status }).eq("id", id);
  if (error) return { ok: false, message: `No se pudo cambiar el estado: ${error.message}` };

  refresh();
  return { ok: true };
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Tu sesión expiró. Vuelve a iniciar sesión." };

  const { data: current } = await supabase.from("products").select("images").eq("id", id).single();

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return { ok: false, message: `No se pudo eliminar la prenda: ${error.message}` };

  await removeImages(current?.images ?? []);

  refresh();
  return { ok: true };
}

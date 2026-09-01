"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ImagePlus, Star, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { createProduct, updateProduct, type ProductPayload } from "@/app/admin/actions";
import { CATEGORIES, SIZES, STATUSES, STATUS_LABEL, STORAGE_BUCKET } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { buildImagePath } from "@/lib/utils";
import type { Product, ProductStatus } from "@/lib/types";

const MAX_FILE_BYTES = 8 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/avif"];

interface PendingFile {
  id: string;
  file: File;
  preview: string;
}

export function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const isEdit = Boolean(product);

  const [title, setTitle] = React.useState(product?.title ?? "");
  const [category, setCategory] = React.useState(product?.category ?? CATEGORIES[0]);
  const [size, setSize] = React.useState(product?.size ?? SIZES[2]);
  const [price, setPrice] = React.useState(product ? String(product.price) : "");
  const [description, setDescription] = React.useState(product?.description ?? "");
  const [status, setStatus] = React.useState<ProductStatus>(product?.status ?? "AVAILABLE");

  const [keptImages, setKeptImages] = React.useState<string[]>(product?.images ?? []);
  const [pendingFiles, setPendingFiles] = React.useState<PendingFile[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState<string | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Libera las previsualizaciones al desmontar.
  React.useEffect(() => {
    return () => {
      pendingFiles.forEach((item) => URL.revokeObjectURL(item.preview));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onFilesSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0) return;

    const rejected: string[] = [];
    const accepted: PendingFile[] = [];

    for (const file of files) {
      if (!ACCEPTED.includes(file.type)) {
        rejected.push(`${file.name}: formato no admitido`);
        continue;
      }
      if (file.size > MAX_FILE_BYTES) {
        rejected.push(`${file.name}: pesa más de 8 MB`);
        continue;
      }
      accepted.push({
        id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 7)}`,
        file,
        preview: URL.createObjectURL(file),
      });
    }

    setPendingFiles((current) => [...current, ...accepted]);
    setError(rejected.length > 0 ? `No se agregaron algunas fotos — ${rejected.join("; ")}.` : null);
  }

  function removeKept(url: string) {
    setKeptImages((current) => current.filter((item) => item !== url));
  }

  function removePending(id: string) {
    setPendingFiles((current) => {
      const target = current.find((item) => item.id === id);
      if (target) URL.revokeObjectURL(target.preview);
      return current.filter((item) => item.id !== id);
    });
  }

  function makeCover(url: string) {
    setKeptImages((current) => [url, ...current.filter((item) => item !== url)]);
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const priceNumber = Number(price);
    if (!title.trim()) {
      setError("Escribe un título para la prenda.");
      return;
    }
    if (!Number.isFinite(priceNumber) || priceNumber < 0) {
      setError("El precio debe ser un número mayor o igual a 0.");
      return;
    }
    if (keptImages.length + pendingFiles.length === 0) {
      setError("Agrega al menos una foto de la prenda.");
      return;
    }

    const supabase = createClient();
    const uploadedUrls: string[] = [];

    try {
      setBusy(pendingFiles.length > 0 ? "Subiendo fotos…" : "Guardando…");

      for (const item of pendingFiles) {
        const path = buildImagePath(item.file);
        const { error: uploadError } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(path, item.file, { cacheControl: "31536000", upsert: false });

        if (uploadError) throw new Error(`No se pudo subir ${item.file.name}: ${uploadError.message}`);

        const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
        uploadedUrls.push(data.publicUrl);
      }

      setBusy("Guardando…");

      const payload: ProductPayload = {
        title,
        description,
        price: priceNumber,
        size,
        category,
        images: [...keptImages, ...uploadedUrls],
        status,
      };

      const result = product ? await updateProduct(product.id, payload) : await createProduct(payload);

      if (!result.ok) throw new Error(result.message ?? "No se pudo guardar la prenda.");

      pendingFiles.forEach((item) => URL.revokeObjectURL(item.preview));
      router.push("/admin");
      router.refresh();
    } catch (submitError) {
      // Si algo falla después de subir, se limpian las fotos huérfanas del bucket.
      if (uploadedUrls.length > 0) {
        const paths = uploadedUrls
          .map((url) => url.split(`/${STORAGE_BUCKET}/`)[1])
          .filter(Boolean) as string[];
        await supabase.storage.from(STORAGE_BUCKET).remove(paths);
      }
      setError(submitError instanceof Error ? submitError.message : "No se pudo guardar la prenda.");
      setBusy(null);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="Título" htmlFor="title">
            <Input
              id="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Blazer de lana gris"
              required
              maxLength={120}
            />
          </Field>
        </div>

        <Field label="Categoría" htmlFor="category">
          <Select id="category" value={category} onChange={(event) => setCategory(event.target.value)}>
            {CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Talla" htmlFor="size">
          <Select id="size" value={size} onChange={(event) => setSize(event.target.value)}>
            {SIZES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Precio" htmlFor="price" hint="En pesos, sin puntos ni símbolos.">
          <Input
            id="price"
            type="number"
            inputMode="numeric"
            min={0}
            step={500}
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            placeholder="18000"
            required
          />
        </Field>

        <Field label="Estado" htmlFor="status">
          <Select
            id="status"
            value={status}
            onChange={(event) => setStatus(event.target.value as ProductStatus)}
          >
            {STATUSES.map((item) => (
              <option key={item} value={item}>
                {STATUS_LABEL[item]}
              </option>
            ))}
          </Select>
        </Field>

        <div className="sm:col-span-2">
          <Field
            label="Descripción"
            htmlFor="description"
            hint="Material, calce, detalles de uso: lo que preguntarían por mensaje."
          >
            <Textarea
              id="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Corte recto, forro interior, dos botones. Sin uso visible."
            />
          </Field>
        </div>
      </div>

      <div>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-sm text-ink-muted">Fotos</h2>
            <p className="mt-1 text-xs text-ink-faint">
              La primera foto es la portada en el catálogo. JPG, PNG, WebP o AVIF, hasta 8 MB.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
            <ImagePlus className="h-4 w-4" strokeWidth={1.5} />
            Agregar fotos
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED.join(",")}
          multiple
          onChange={onFilesSelected}
          className="sr-only"
        />

        {keptImages.length + pendingFiles.length === 0 ? (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-4 flex h-40 w-full items-center justify-center border border-dashed border-paper-line text-sm text-ink-faint transition-colors hover:border-ink hover:text-ink"
          >
            Sube la primera foto de la prenda
          </button>
        ) : (
          <ul className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
            {keptImages.map((url, index) => (
              <li key={url} className="relative aspect-[3/4] overflow-hidden bg-paper-soft">
                <Image src={url} alt="" fill sizes="20vw" className="object-cover" />
                <button
                  type="button"
                  onClick={() => removeKept(url)}
                  aria-label="Quitar foto"
                  className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center bg-paper/90 hover:bg-paper"
                >
                  <X className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>
                {index === 0 ? (
                  <span className="absolute bottom-1 left-1 bg-ink px-1.5 py-0.5 text-[10px] text-paper">
                    Portada
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => makeCover(url)}
                    aria-label="Usar como portada"
                    className="absolute bottom-1 left-1 flex h-7 w-7 items-center justify-center bg-paper/90 hover:bg-paper"
                  >
                    <Star className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </button>
                )}
              </li>
            ))}

            {pendingFiles.map((item) => (
              <li key={item.id} className="relative aspect-[3/4] overflow-hidden bg-paper-soft">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.preview} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePending(item.id)}
                  aria-label="Quitar foto"
                  className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center bg-paper/90 hover:bg-paper"
                >
                  <X className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>
                <span className="absolute bottom-1 left-1 bg-paper/90 px-1.5 py-0.5 text-[10px]">
                  Sin subir
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error ? (
        <p role="alert" className="border border-paper-line px-3 py-2 text-sm">
          {error}
        </p>
      ) : null}

      <div className="flex items-center gap-3 border-t border-paper-line pt-6">
        <Button type="submit" size="lg" disabled={Boolean(busy)}>
          {busy ?? (isEdit ? "Guardar cambios" : "Publicar prenda")}
        </Button>
        <Link href="/admin" className="text-sm text-ink-muted transition-colors hover:text-ink">
          Cancelar
        </Link>
      </div>
    </form>
  );
}

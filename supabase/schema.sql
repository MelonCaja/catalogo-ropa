-- =====================================================================
-- Catálogo de ropa de segunda mano — esquema completo para Supabase
-- Ejecutar en: Supabase Dashboard -> SQL Editor -> New query -> Run
-- Es idempotente: se puede volver a ejecutar sin romper nada.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Tipo enumerado para el estado de la prenda
-- ---------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'product_status') then
    create type public.product_status as enum ('AVAILABLE', 'RESERVED', 'SOLD');
  end if;
end
$$;

-- ---------------------------------------------------------------------
-- 2. Tabla de prendas
-- ---------------------------------------------------------------------
create table if not exists public.products (
  id          uuid primary key default gen_random_uuid(),
  title       text not null check (char_length(trim(title)) > 0),
  description text,
  price       integer not null check (price >= 0),
  size        text,
  category    text,
  images      text[] not null default '{}',
  status      public.product_status not null default 'AVAILABLE',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists products_created_at_idx on public.products (created_at desc);
create index if not exists products_category_idx   on public.products (category);
create index if not exists products_status_idx     on public.products (status);

-- Mantiene updated_at al día en cada UPDATE
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
  before update on public.products
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- 3. Row Level Security en products
--    Lectura pública · escritura solo para usuarios autenticados
-- ---------------------------------------------------------------------
alter table public.products enable row level security;

drop policy if exists "products_public_read"   on public.products;
drop policy if exists "products_auth_insert"   on public.products;
drop policy if exists "products_auth_update"   on public.products;
drop policy if exists "products_auth_delete"   on public.products;

create policy "products_public_read"
  on public.products for select
  to anon, authenticated
  using (true);

create policy "products_auth_insert"
  on public.products for insert
  to authenticated
  with check (auth.uid() is not null);

create policy "products_auth_update"
  on public.products for update
  to authenticated
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

create policy "products_auth_delete"
  on public.products for delete
  to authenticated
  using (auth.uid() is not null);

-- ---------------------------------------------------------------------
-- 4. Bucket de imágenes (público para lectura)
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  8388608, -- 8 MB por archivo
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- ---------------------------------------------------------------------
-- 5. Políticas del bucket product-images
-- ---------------------------------------------------------------------
drop policy if exists "product_images_public_read" on storage.objects;
drop policy if exists "product_images_auth_insert" on storage.objects;
drop policy if exists "product_images_auth_update" on storage.objects;
drop policy if exists "product_images_auth_delete" on storage.objects;

create policy "product_images_public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'product-images');

create policy "product_images_auth_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'product-images' and auth.uid() is not null);

create policy "product_images_auth_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'product-images' and auth.uid() is not null)
  with check (bucket_id = 'product-images' and auth.uid() is not null);

create policy "product_images_auth_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'product-images' and auth.uid() is not null);

-- ---------------------------------------------------------------------
-- 6. Datos de ejemplo (opcional: borrar si no se quieren)
-- ---------------------------------------------------------------------
insert into public.products (title, description, price, size, category, status)
values
  ('Blazer de lana gris', 'Corte recto, forro interior, dos botones. Sin uso visible.', 32000, 'M', 'Chaquetas', 'AVAILABLE'),
  ('Vestido midi negro', 'Tejido liviano, tirantes ajustables. Ideal para verano.', 18000, 'S', 'Vestidos', 'RESERVED'),
  ('Jeans rectos tiro alto', 'Denim rígido, largo tobillero. Marcas mínimas en el ruedo.', 15000, 'L', 'Pantalones', 'SOLD')
on conflict do nothing;

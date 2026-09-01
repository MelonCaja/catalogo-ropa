# Catálogo de ropa de segunda mano

Lookbook editorial minimalista para mostrar prendas usadas y cerrar la venta por Instagram o correo.
Sin carrito ni pasarela de pago, y sin exponer un número de teléfono personal: el catálogo es
público y el panel de administración es privado.

**Stack:** Next.js 15 (App Router, Server Actions) · TypeScript · Tailwind CSS · Supabase (Postgres + Auth + Storage) · Lucide.

---

## Puesta en marcha

### 1. Instalar
```bash
npm install
cp .env.example .env.local
```

### 2. Crear la base de datos
En Supabase: **SQL Editor → New query**, pega `supabase/schema.sql` y ejecútalo.
Crea la tabla `products`, el enum de estados, el bucket `product-images` y todas las políticas RLS.
El script es idempotente: se puede volver a correr sin romper nada.

### 3. Completar `.env.local`
| Variable | Dónde se obtiene |
| --- | --- |
| `NEXT_PUBLIC_STORE_NAME` | El nombre que aparece en el header |
| `NEXT_PUBLIC_SUPABASE_URL` | Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Project Settings → API → `anon` public |
| `NEXT_PUBLIC_INSTAGRAM_USER` | Usuario de Instagram sin `@` (para el enlace `ig.me/m/<usuario>`) |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Correo para el enlace "Consultar por correo" |

### 4. Crear el usuario administrador
Supabase → **Authentication → Users → Add user**, con correo y contraseña.
Conviene desactivar **Allow new users to sign up** (Authentication → Providers → Email) para que nadie más se registre.

### 5. Levantar
```bash
npm run dev
```
Catálogo en `/`, panel en `/admin`, login en `/login`.

---

## Estructura

```
.
├── middleware.ts                    Refresca la sesión y protege /admin
├── next.config.mjs                  Permite imágenes del Storage de Supabase
├── supabase/schema.sql              Tablas, enum, bucket y políticas RLS
└── src
    ├── app
    │   ├── layout.tsx               Fuente, metadatos y estilos globales
    │   ├── globals.css
    │   ├── page.tsx                 Catálogo público (Server Component)
    │   ├── not-found.tsx
    │   ├── login/page.tsx
    │   ├── auth/signout/route.ts     POST → cierra sesión
    │   └── admin
    │       ├── layout.tsx           Cabecera del panel + sesión activa
    │       ├── page.tsx             Listado de prendas
    │       ├── actions.ts           Server Actions: crear, editar, estado, eliminar
    │       ├── nuevo/page.tsx
    │       └── [id]/editar/page.tsx
    ├── components
    │   ├── catalog.tsx              Filtros (categoría, talla, disponibilidad) + grilla
    │   ├── product-card.tsx
    │   ├── product-detail.tsx       Modal con carrusel, SKU y flujo de contacto por Instagram/correo
    │   ├── product-form.tsx         Alta/edición con subida de fotos y preview
    │   ├── admin-table.tsx          Buscador en vivo (SKU/título/categoría) + estado y borrado
    │   ├── login-form.tsx
    │   └── ui                       button · badge · field · modal · confirm-dialog
    └── lib
        ├── constants.ts             Categorías, tallas, estados, bucket
        ├── types.ts                 Tipos de dominio y de la base de datos
        ├── utils.ts                 cn, precios en CLP, SKU, enlaces de Instagram/correo, rutas de Storage
        └── supabase                 client (navegador) · server (RSC/actions) · middleware
```

---

## Cómo funciona

**Seguridad.** Toda la escritura está protegida en dos capas: el middleware redirige a `/login` a quien
no tenga sesión, y las políticas RLS de Postgres y Storage exigen `auth.uid() is not null` para
`INSERT`, `UPDATE` y `DELETE`. Aunque alguien use la clave anónima desde afuera, solo puede leer.

**Fotos.** El navegador sube los archivos directo al bucket `product-images` (así no pasan por el
servidor de Next) y luego una Server Action guarda las URLs públicas en la fila. Si la acción falla
después de subir, el cliente borra las fotos huérfanas. Al eliminar una prenda o quitarle una foto,
la acción también borra los objetos del bucket.

**SKU.** Cada prenda tiene una referencia corta derivada (no se guarda en la base): 3 letras de la
categoría + los primeros 4 caracteres del `id`, p. ej. `VES-B301`. Se calcula en `productSku`
(`src/lib/utils.ts`) y se muestra en la card, en el detalle y en el buscador del panel.

**Contacto.** El detalle no expone teléfono. El botón principal *"Mensaje por Instagram"* copia al
portapapeles *"¡Hola! Me interesa la prenda: … (SKU: VES-B301, Talla: M, Precio: $32.000)"* y abre un
sub-modal con la vista previa y el enlace a `ig.me/m/<usuario>`. El enlace secundario *"Consultar por
correo"* arma un `mailto:` con el SKU en el asunto y el cuerpo. Las prendas reservadas o vendidas
muestran su estado sobre los mismos canales.

**Precios.** Se guardan como enteros (pesos, sin decimales) y se muestran con `Intl.NumberFormat`
en `es-CL`. Para otra moneda, cambia `formatPrice` en `src/lib/utils.ts`.

---

## Deploy en Vercel

1. Sube el repo a GitHub e impórtalo en Vercel.
2. Agrega las cinco variables de entorno de `.env.example` en **Settings → Environment Variables**.
3. Deploy. `next.config.mjs` lee el host de Supabase desde `NEXT_PUBLIC_SUPABASE_URL`, así que
   `next/image` queda configurado solo.
4. En Supabase, agrega la URL de producción en **Authentication → URL Configuration**.

## Ajustes frecuentes

- **Categorías y tallas:** `src/lib/constants.ts` (el catálogo, los filtros y el formulario los leen de ahí).
- **Paleta y tipografía:** `tailwind.config.ts` y la fuente en `src/app/layout.tsx`.
- **Formato de la grilla:** el `aspect-[4/5]` de `product-card.tsx` y `product-detail.tsx`.
- **Formato del SKU:** `productSku` en `src/lib/utils.ts`.

export type ProductStatus = "AVAILABLE" | "RESERVED" | "SOLD";

export type Product = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  size: string | null;
  category: string | null;
  images: string[];
  status: ProductStatus;
  created_at: string;
  updated_at: string;
};

export type ProductInput = Omit<Product, "id" | "created_at" | "updated_at">;

export interface ActionResult {
  ok: boolean;
  message?: string;
}

/**
 * Tipado mínimo de la base de datos con la forma que espera supabase-js.
 * Se puede reemplazar por el archivo generado con:
 *   npx supabase gen types typescript --project-id <ref> > src/lib/types.ts
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      products: {
        Row: Product;
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          price: number;
          size?: string | null;
          category?: string | null;
          images?: string[];
          status?: ProductStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          price?: number;
          size?: string | null;
          category?: string | null;
          images?: string[];
          status?: ProductStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: {
      product_status: ProductStatus;
    };
    CompositeTypes: Record<never, never>;
  };
}

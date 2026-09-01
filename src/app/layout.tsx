import type { Metadata } from "next";
import { Archivo, Cormorant_Garamond } from "next/font/google";

import { STORE_NAME } from "@/lib/constants";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-archivo",
});

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: {
    default: `${STORE_NAME} — ropa de segunda mano`,
    template: `%s · ${STORE_NAME}`,
  },
  description:
    "Catálogo de prendas de segunda mano seleccionadas una por una. Escribe por WhatsApp y coordinamos la entrega.",
  openGraph: {
    title: `${STORE_NAME} — ropa de segunda mano`,
    description: "Prendas únicas, en buen estado y a buen precio.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${archivo.variable} ${serif.variable}`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}

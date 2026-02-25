// app/layout.tsx
import type { Metadata, Viewport } from "next";
import type { Metadata } from "next";
import { Roboto } from "next/font/google"; // <--- Importe a Roboto
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

// Configure a fonte
const roboto = Roboto({ 
  subsets: ["latin"], 
  weight: ["300", "400", "500", "700"],
  variable: "--font-roboto",
});

// Isso força os celulares a lerem o tamanho real da tela (ativando o modo mobile do Tailwind)
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, // Opcional, mas evita que o layout quebre ao dar zoom nos inputs
};

export const metadata: Metadata = {
  title: "SGP Reforsolo",
  description: "Gerador de Propostas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR"> {/* <--- Garanta que está pt-BR */}
      <body className={`${roboto.variable} font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}

// app/layout.tsx
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

export const metadata: Metadata = {
  title: "SGP Reforsolo - Editor v8",
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
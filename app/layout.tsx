import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import WhatsAppFloat from "@/components/WhatsAppFloat";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EasyDoctors - Escolha seu Plano",
  description: "Escolha seu plano de telemedicina em 3 passos simples",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        {children}
        
        {/* Botão flutuante do WhatsApp - aparece em todas as telas */}
        <WhatsAppFloat />
      </body>
    </html>
  );
}


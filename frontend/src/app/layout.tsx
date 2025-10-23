import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/providers/AuthProvider"; // Импортируем
import { QueryProvider } from "@/providers/QueryProvider"; // <-- 1. Импортируем наш новый провайдер
import { Toaster } from "@/components/ui/sonner"; // <-- ИМПОРТ ИЗМЕНИЛСЯ

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ascend",
  description: "Your Personal Dashboard for Life's Climb.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <QueryProvider>
            {children}
          </QueryProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
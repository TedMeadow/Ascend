"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";

export function QueryProvider({ children }: { children: ReactNode }) {
  // ✅ ИСПРАВЛЕНИЕ: Используем правильную деструктуризацию массива
  // Мы получаем только первый элемент (сам клиент), так как нам не нужна функция для его изменения.
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
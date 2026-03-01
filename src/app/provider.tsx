"use client";

import { Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { InitProvider } from "@/components/Init";
import { Notice } from "@/components/Notice";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 минута
      gcTime: 1000 * 60 * 5, // 5 минут
      refetchOnMount: false, // true давало 8+ 401 при открытии tg-login (CrowdSec)
      refetchOnWindowFocus: true,
    },
  },
});

export function Provider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <Suspense
        fallback={
          <Notice
            msg={{
              variant: "loading",
              title: "Загрузка",
              description: "Проверяем подключение…",
            }}
          />
        }
      >
        <InitProvider>
          <TooltipProvider>
            {children}
            <Toaster position="top-center" />
          </TooltipProvider>
        </InitProvider>
      </Suspense>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

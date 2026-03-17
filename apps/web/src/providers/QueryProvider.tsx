"use client";

/**
 * QueryProvider — TanStack Query Client
 *
 * Defaults (global):
 *   staleTime:            30s   — Daten gelten 30s als frisch; kein Re-Fetch innerhalb dieser Zeit
 *   gcTime:               5min  — Cache wird 5 Minuten gehalten, dann garbage-collected
 *   refetchOnWindowFocus: false — Kein Re-Fetch beim Tab-Wechsel (Finanz-UX: kein unerwartetes Flackern)
 *   retry:                2     — 2 Retry-Versuche bei Netzwerkfehlern
 *
 * Jede Route bekommt ihren eigenen QueryClient-Singleton via useState,
 * verhindert State-Sharing zwischen Server-Renders (Next.js SSR-Safe).
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode }          from "react";

function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime:            30_000,
        gcTime:               300_000,
        retry:                2,
        refetchOnWindowFocus: false,
      },
    },
  });
}

export function QueryProvider({ children }: { children: ReactNode }) {
  // useState verhindert Re-Instantiierung bei Server-Komponenten-Rerender
  const [queryClient] = useState(makeQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

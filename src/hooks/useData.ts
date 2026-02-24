"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

interface UseDataParams {
  token: "public" | "user" | "admin";
  collection: string;
  key: string;
  type: "item" | "items" | "singleton";
  query?: Record<string, unknown>;
}

async function fetchData(params: UseDataParams) {
  const res = await fetch("/api/data/read", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
    credentials: params.token === "user" ? "include" : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error ?? "Failed to fetch data");
  }
  return res.json();
}

export function useData<T = unknown>(
  params: UseDataParams | null,
  options?: Omit<UseQueryOptions<T>, "queryKey" | "queryFn">,
) {
  return useQuery<T>({
    queryKey: [params?.collection, params?.key, params?.token],
    queryFn: () => fetchData(params!) as Promise<T>,
    enabled: params != null,
    ...options,
  });
}

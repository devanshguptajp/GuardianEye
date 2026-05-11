import type { UseQueryOptions, QueryKey } from "@tanstack/react-query";

/**
 * Helper to build partial query options (without `queryKey`) that the Orval-
 * generated hooks accept. The generated `getXxxQueryOptions` helper fills in
 * `queryKey` automatically, so callers only need to supply overrides like
 * `enabled`, `staleTime`, etc.
 *
 * Usage:
 *   useGetMyProfile({ query: queryOpts({ enabled: !!user }) })
 */
export function queryOpts<
  TData = unknown,
  TError = unknown,
>(
  opts: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">,
): UseQueryOptions<TData, TError> {
  return opts as UseQueryOptions<TData, TError>;
}

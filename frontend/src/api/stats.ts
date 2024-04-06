import { queryOptions } from "@tanstack/react-query";

import { fetcher } from "@/api";
import { Count, CountPerHour, CountPerIdWrapper } from "@/types/backendTypes";

export const statsCountQueryOptions = queryOptions({
  queryKey: ["stats", "count"],
  queryFn: async ({ signal }) =>
    await fetcher.get<Count>("/stats/count", {
      signal,
    }),
});

export const statsCountRequestsBySourcesQueryOptions = queryOptions({
  queryKey: ["stats", "count", "requests", "sources"],
  queryFn: async ({ signal }) =>
    await fetcher.get<CountPerIdWrapper[]>("/stats/count/requests/sources", {
      signal,
    }),
});

export const statsCountRequestsByProvidersQueryOptions = queryOptions({
  queryKey: ["stats", "count", "requests", "providers"],
  queryFn: async ({ signal }) =>
    await fetcher.get<CountPerIdWrapper[]>("/stats/count/requests/providers", {
      signal,
    }),
});

export const statsCountRequestsByKindsQueryOptions = queryOptions({
  queryKey: ["stats", "count", "requests", "kinds"],
  queryFn: async ({ signal }) =>
    await fetcher.get<CountPerIdWrapper[]>("/stats/count/requests/kinds", {
      signal,
    }),
});

export const statsCountRequestsByHourQueryOptions = queryOptions({
  queryKey: ["stats", "count", "requests", "hour"],
  queryFn: async ({ signal }) =>
    await fetcher.get<CountPerHour[]>("/stats/count/requests", {
      signal,
    }),
});

import { queryOptions } from "@tanstack/react-query";

import { fetcher } from "@/api";
import { Count } from "@/types/backendTypes";

export const statsCountQueryOptions = queryOptions({
  queryKey: ["stats", "count"],
  queryFn: async ({ signal }) =>
    await fetcher.get<Count>("/stats/count", {
      signal,
    }),
});

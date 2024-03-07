import { queryOptions } from "@tanstack/react-query";

import { fetcher } from "@/api";
import { NotificationKind } from "@/types/backendTypes";

export const notificationsQueryOptions = queryOptions({
  queryKey: ["notifications"],
  queryFn: async ({ signal }) =>
    await fetcher.get<NotificationKind[]>("/notifications", {
      signal,
    }),
});

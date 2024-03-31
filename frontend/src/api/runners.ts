import { useQuery } from "@tanstack/react-query";

import config from "@/config";
import { queryClient } from "@/api";
import { SourceKind } from "@/types/backendTypes";

export type RunnerStatus =
  | "UNKNOWN"
  | "SERVING"
  | "NOT_SERVING"
  | "SERVICE_UNKNOWN";

interface RunnersStatus {
  [SourceKind.Python]?: RunnerStatus;
  [SourceKind.JavaScript]?: RunnerStatus;
}

export const useRunnersStatus = () =>
  useQuery<RunnersStatus>({
    refetchOnWindowFocus: false,
    queryKey: ["runners", "status"],
    queryFn: async ({ queryKey }) =>
      await new Promise((_resolve, reject) => {
        const url = new URL(
          `${config.rest_server_base_url}/runners/status/sse`
        );

        const sse = new EventSource(url);

        sse.onerror = (event) => {
          sse.close();
          reject(event);
        };

        sse.onopen = () => {
          queryClient.invalidateQueries({ queryKey: ["stats", "count"] });
        };

        sse.onmessage = (event) => {
          const data = event.data as RunnerStatus;
          const id = event.lastEventId as
            | SourceKind.Python
            | SourceKind.JavaScript;

          queryClient.setQueryData<RunnersStatus>(queryKey, (oldData) => ({
            ...(oldData ?? {}),
            [id]: data,
          }));
        };
      }),
  });

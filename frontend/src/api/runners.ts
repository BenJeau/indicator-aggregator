import { useQuery } from "@tanstack/react-query";
import { fetchEventSource } from "@microsoft/fetch-event-source";

import config from "@/lib/config";
import { SourceKind } from "@/types/backendTypes";
import { store } from "@/atoms";
import { userAtom } from "@/atoms/auth";
import { queryClient } from "@/lib/query";

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
      await new Promise((resolve, reject) => {
        const token = store.get(userAtom)!.token;

        fetchEventSource(`${config.rest_server_base_url}/runners/status/sse`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          onerror: (event) => {
            reject(event);
          },
          onmessage: (event) => {
            const data = event.data as RunnerStatus;
            const id = event.id as SourceKind.Python | SourceKind.JavaScript;

            queryClient.setQueryData<RunnersStatus>(queryKey, (oldData) => ({
              ...(oldData ?? {}),
              [id]: data,
            }));
          },
          onclose: () => {
            resolve(queryClient.getQueryData(queryKey) ?? {});
          },
        });
      }),
  });

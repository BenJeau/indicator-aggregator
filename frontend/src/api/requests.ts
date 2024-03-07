import { queryOptions, useQuery } from "@tanstack/react-query";

import { fetcher, queryClient } from "@/api";
import {
  Request,
  SourceRequest,
  RequestExecuteParam,
  SourceError,
  SseStartData,
  SseDoneData,
  DataSource,
  DataTiming,
  DataCache,
} from "@/types/backendTypes";
import config from "@/config";

export interface ReqestSSEData {
  source: DataSource;
  timing?: DataTiming;
  cache?: DataCache;
  hasSourceCode: boolean;
  errors: SourceError[];
  data?: unknown;
}

export interface ModifiedRequest extends Omit<RequestExecuteParam, "sources"> {
  sources: {
    id: string;
    name: string;
  }[];
}

interface RequestData {
  requestId?: string;
  data?: { [key: string]: ReqestSSEData };
}

export const useRequest = (request: ModifiedRequest | undefined) =>
  useQuery<RequestData>({
    refetchOnWindowFocus: false,
    queryKey: ["requests", request],
    queryFn: async ({ queryKey }) =>
      await new Promise((resolve, reject) => {
        if (request === undefined) {
          resolve({});
        }

        const url = new URL(
          `${config.rest_server_base_url}/requests/execute/sse`
        );
        const searchParamParts: string[] = [
          `data=${request!.data}`,
          `kind=${request!.kind}`,
        ];
        for (const source of request?.sources ?? []) {
          searchParamParts.push(`sources=${source.id}`);
        }
        url.search = searchParamParts.join("&");

        const sse = new EventSource(url);

        sse.onerror = (event) => {
          sse.close();
          reject(event);
        };

        sse.onopen = () => {
          queryClient.invalidateQueries({ queryKey: ["stats", "count"] });
        };

        sse.addEventListener("fetching_start", (event) => {
          const data = JSON.parse(event.data) as SseStartData[];

          const newData = data.reduce(
            (acc, { source, hasSourceCode }) => ({
              ...acc,
              requestId: event.lastEventId,
              data: {
                ...(acc?.data ?? {}),
                [source.id]: {
                  source,
                  hasSourceCode,
                  errors: [],
                },
              },
            }),
            {} as RequestData
          );

          queryClient.setQueryData<RequestData>(queryKey, () => newData);
        });

        sse.addEventListener("fetching_error", (event) => {
          const errors = JSON.parse(event.data) as SourceError[];

          queryClient.setQueryData<RequestData>(queryKey, (oldData) => ({
            ...(oldData ?? {}),
            data: {
              ...(oldData?.data ?? {}),
              [event.lastEventId]: {
                ...(oldData?.data ?? {})[event.lastEventId],
                errors,
              },
            },
          }));
        });

        sse.addEventListener("fetching_data", (event) => {
          const doneData = JSON.parse(event.data) as SseDoneData;

          queryClient.setQueryData<RequestData>(queryKey, (oldData) => ({
            ...(oldData ?? {}),
            data: {
              ...(oldData?.data ?? {}),
              [event.lastEventId]: {
                ...(oldData?.data ?? {})[event.lastEventId],
                ...doneData,
              },
            },
          }));
        });
      }),
  });

export const requestsQueryOptions = queryOptions({
  queryKey: ["requests"],
  queryFn: async ({ signal }) => {
    const data = await fetcher.get<Request[]>("/requests", {
      signal,
    });

    data.map((request) => {
      queryClient.setQueryData(["requests", request.id], request);
    });

    return data;
  },
});

export const requestQueryOptions = (requestId: string) =>
  queryOptions({
    queryKey: ["requests", requestId],
    queryFn: async ({ signal }) =>
      await fetcher.get<Request>(`/requests/${requestId}`, {
        signal,
      }),
  });

export const requestDataQueryOptions = (requestId: string) =>
  queryOptions({
    queryKey: ["requests", requestId, "data"],
    queryFn: async ({ signal }) =>
      await fetcher.get<SourceRequest[]>(`/requests/${requestId}/history`, {
        signal,
      }),
  });

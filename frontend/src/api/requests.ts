import { QueryKey, queryOptions, useQuery } from "@tanstack/react-query";
import {
  fetchEventSource,
  EventSourceMessage,
} from "@microsoft/fetch-event-source";

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
import config from "@/lib/config";
import { store } from "@/atoms";
import { userAtom } from "@/atoms/auth";

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

        const searchParamParts: string[] = [
          `data=${request!.data}`,
          `kind=${request!.kind}`,
        ];
        for (const source of request?.sources ?? []) {
          searchParamParts.push(`source_ids=${source.id}`);
        }

        const token = store.get(userAtom)!.token;

        fetchEventSource(
          `${config.rest_server_base_url}/requests/execute/sse?${searchParamParts.join("&")}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            onerror: (event) => {
              reject(event);
            },
            onopen: async () => {
              queryClient.invalidateQueries({ queryKey: ["stats", "count"] });
            },
            onmessage: async (event) => {
              if (event.event === "fetching_start") {
                handleFetchingStart(event, queryKey);
              } else if (event.event === "fetching_error") {
                handleFetchingError(event, queryKey);
              } else if (event.event === "fetching_data") {
                handleFetchingData(event, queryKey);
              }
            },
            onclose: () => {
              resolve(queryClient.getQueryData(queryKey) ?? {});
            },
          },
        );
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

const handleFetchingData = (event: EventSourceMessage, queryKey: QueryKey) => {
  const doneData = JSON.parse(event.data) as SseDoneData;

  queryClient.setQueryData<RequestData>(queryKey, (oldData) => ({
    ...(oldData ?? {}),
    data: {
      ...(oldData?.data ?? {}),
      [event.id]: {
        ...(oldData?.data ?? {})[event.id],
        ...doneData,
      },
    },
  }));
};

const handleFetchingError = (event: EventSourceMessage, queryKey: QueryKey) => {
  const errors = JSON.parse(event.data) as SourceError[];

  queryClient.setQueryData<RequestData>(queryKey, (oldData) => ({
    ...(oldData ?? {}),
    data: {
      ...(oldData?.data ?? {}),
      [event.id]: {
        ...(oldData?.data ?? {})[event.id],
        errors,
      },
    },
  }));
};

const handleFetchingStart = (event: EventSourceMessage, queryKey: QueryKey) => {
  const data = JSON.parse(event.data) as SseStartData[];

  const newData = data.reduce(
    (acc, { source, hasSourceCode }) => ({
      ...acc,
      requestId: event.id,
      data: {
        ...(acc?.data ?? {}),
        [source.id]: {
          source,
          hasSourceCode,
          errors: [],
        },
      },
    }),
    {} as RequestData,
  );

  queryClient.setQueryData<RequestData>(queryKey, () => newData);
};

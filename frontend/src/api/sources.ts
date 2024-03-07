import { queryOptions, useMutation } from "@tanstack/react-query";

import { fetcher, queryClient } from "@/api";
import {
  CreateSource,
  CreateSourceSecret,
  IgnoreList,
  Request,
  Source,
  SourceSecret,
  UpdateSource,
} from "@/types/backendTypes";

export const sourcesQueryOptions = queryOptions({
  queryKey: ["sources"],
  queryFn: async ({ signal }) => {
    const data = await fetcher.get<Source[]>("/sources", {
      signal,
    });

    data.map((source) => {
      queryClient.setQueryData(["sources", source.id], source);
    });

    return data;
  },
});

export const sourceQueryOptions = (sourceId: string) =>
  queryOptions({
    queryKey: ["sources", sourceId],
    queryFn: async ({ signal }) =>
      await fetcher.get<Source>(`/sources/${sourceId}`, {
        signal,
      }),
  });

export const sourceIgnoreListsQueryOptions = (sourceId: string) =>
  queryOptions({
    queryKey: ["sources", sourceId, "ignoreLists"],
    queryFn: async ({ signal }) =>
      await fetcher.get<IgnoreList[]>(`/sources/${sourceId}/ignoreLists`, {
        signal,
      }),
  });

export const sourceSecretsQueryOptions = (sourceId: string) =>
  queryOptions({
    queryKey: ["sources", sourceId, "secrets"],
    queryFn: async ({ signal }) =>
      await fetcher.get<SourceSecret[]>(`/sources/${sourceId}/secrets`, {
        signal,
      }),
  });

interface SourceIgnoreListPut {
  id: string;
  data: string[];
}

export const usePutSourceIgnoreListMutation = () =>
  useMutation({
    mutationFn: async ({ id, data }: SourceIgnoreListPut) => {
      await fetcher.put(`/sources/${id}/ignoreLists`, { data });
    },
    onSettled: async (_data, _error_, { id }) => {
      await queryClient.invalidateQueries({
        queryKey: ["sources", id, "ignoreLists"],
      });
    },
  });

interface SourceSecretsPut {
  id: string;
  data: CreateSourceSecret[];
}

export const usePutSourceSecretsMutation = () =>
  useMutation({
    mutationFn: async ({ id, data }: SourceSecretsPut) => {
      await fetcher.put(`/sources/${id}/secrets`, { data });
    },
    onSettled: async (_data, _error_, { id }) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["sources", id, "secrets"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["notifications"],
        }),
      ]);
    },
  });

export const useCreateSourceMutation = () =>
  useMutation({
    mutationFn: async (data: CreateSource) =>
      await fetcher.post<string>("/sources", { data }),
    onSettled: async () =>
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["sources"] }),
        queryClient.invalidateQueries({ queryKey: ["stats", "count"] }),
      ]),
  });

export const useDeleteSourceMutation = () =>
  useMutation({
    mutationFn: async (id: string) => await fetcher.delete(`/sources/${id}`),
    onSettled: async () =>
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["sources"] }),
        queryClient.invalidateQueries({ queryKey: ["stats", "count"] }),
      ]),
  });

interface UpdateSourceParams {
  id: string;
  data: UpdateSource;
}

export const useUpdateSourceMutation = () =>
  useMutation({
    mutationFn: async ({ id, data }: UpdateSourceParams) =>
      await fetcher.patch(`/sources/${id}`, { data }),
    onSettled: async (_data, _error, { id }) =>
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["sources"] }),
        queryClient.invalidateQueries({ queryKey: ["sources", id] }),
      ]),
  });

export const sourceRequestsQueryOptions = (sourceId: string) =>
  queryOptions({
    queryKey: ["sources", sourceId, "requests"],
    queryFn: async ({ signal }) =>
      await fetcher.get<Request[]>(`/sources/${sourceId}/requests`, {
        signal,
      }),
  });

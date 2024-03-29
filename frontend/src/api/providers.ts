import { queryOptions, useMutation } from "@tanstack/react-query";

import { fetcher, queryClient } from "@/api";
import {
  CreateProvider,
  IgnoreList,
  PatchProvider,
  ProviderWithNumSources,
  Source,
} from "@/types/backendTypes";

export const providersQueryOptions = queryOptions({
  queryKey: ["providers"],
  queryFn: async ({ signal }) => {
    const data = await fetcher.get<ProviderWithNumSources[]>("/providers", {
      signal,
    });

    data.map((provider) => {
      queryClient.setQueryData(["providers", provider.id], provider);
    });

    return data;
  },
});

export const providerQueryOptions = (providerId?: string) =>
  queryOptions({
    queryKey: ["providers", providerId],
    queryFn: async ({ signal }) => {
      if (!providerId) {
        return null;
      }

      return await fetcher.get<ProviderWithNumSources>(
        `/providers/${providerId}`,
        {
          signal,
        },
      );
    },
  });

export const providerIgnoreListsQueryOptions = (providerId: string) =>
  queryOptions({
    queryKey: ["providers", providerId, "ignoreLists"],
    queryFn: async ({ signal }) =>
      await fetcher.get<IgnoreList[]>(`/providers/${providerId}/ignoreLists`, {
        signal,
      }),
  });

export const useProviderDelete = () =>
  useMutation({
    mutationFn: async (id: string) => {
      await fetcher.delete(`/providers/${id}`);
    },
    onSettled: async () =>
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["providers"] }),
        queryClient.invalidateQueries({ queryKey: ["stats", "count"] }),
      ]),
  });

interface ProviderPatch {
  id: string;
  data: PatchProvider;
}

export const useProviderPatch = () =>
  useMutation({
    mutationFn: async ({ id, data }: ProviderPatch) => {
      await fetcher.patch(`/providers/${id}`, { data });
    },
    onSettled: async () =>
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["providers"] }),
        queryClient.invalidateQueries({ queryKey: ["stats", "count"] }),
      ]),
  });

export const useProviderCreate = () =>
  useMutation({
    mutationFn: async (data: CreateProvider) => {
      return await fetcher.post<string>("/providers", { data });
    },
    onSettled: async () =>
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["providers"] }),
        queryClient.invalidateQueries({ queryKey: ["stats", "count"] }),
      ]),
  });

interface ProviderIgnoreListPut {
  id: string;
  data: string[];
}

export const usePutProviderIgnoreListsMutation = () =>
  useMutation({
    mutationFn: async ({ id, data }: ProviderIgnoreListPut) => {
      await fetcher.put(`/providers/${id}/ignoreLists`, { data });
    },
    onSettled: async (_data, _error_, { id }) => {
      await queryClient.invalidateQueries({
        queryKey: ["providers", id, "ignoreLists"],
      });
    },
  });

export const usePutProviderSourcesMutation = () =>
  useMutation({
    mutationFn: async ({ id, data }: ProviderIgnoreListPut) => {
      await fetcher.put(`/providers/${id}/sources`, { data });
    },
    onSettled: async (_data, _error, { id }) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["providers", id, "sources"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["providers", id],
        }),
      ]);
    },
  });

export const providerSourcesQueryOptions = (providerId: string) =>
  queryOptions({
    queryKey: ["providers", providerId, "sources"],
    queryFn: async ({ signal }) => {
      const data = await fetcher.get<Source[]>(
        `/providers/${providerId}/sources`,
        {
          signal,
        },
      );

      data.map((source) => {
        queryClient.setQueryData(["sources", source.id], source);
      });

      return data;
    },
  });

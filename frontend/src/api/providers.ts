import { queryOptions, useMutation } from "@tanstack/react-query";

import { fetcher } from "@/api";
import {
  CreateProvider,
  IdSlug,
  IgnoreList,
  PatchProvider,
  Provider,
  Source,
} from "@/types/backendTypes";
import { queryClient } from "@/lib/query";

export const providersQueryOptions = queryOptions({
  queryKey: ["providers"],
  queryFn: async ({ signal }) => {
    const data = await fetcher.get<Provider[]>("/providers", {
      signal,
    });

    data.forEach((provider) => {
      queryClient.setQueryData(["providers", provider.id], provider);
    });

    return data;
  },
});

export function providerSlugQueryOptions(slug: string) {
  return queryOptions({
    queryKey: ["providers", "slugs", slug],
    queryFn: async ({ signal }) =>
      await fetcher.get<string>(`/providers/slugs/${slug}`, {
        signal,
      }),
  });
}

export function providerQueryOptions<T extends undefined | string>(
  providerId: T,
) {
  return queryOptions({
    queryKey: ["providers", providerId],
    queryFn: async ({ signal }) => {
      if (!providerId) {
        return null;
      }

      return await fetcher.get<Provider>(`/providers/${providerId}`, {
        signal,
      });
    },
  });
}

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
      return await fetcher.post<IdSlug>("/providers", { data });
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

      data.forEach((source) => {
        queryClient.setQueryData(["sources", source.id], source);
      });

      return data;
    },
  });

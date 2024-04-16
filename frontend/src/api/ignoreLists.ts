import { queryOptions, useMutation } from "@tanstack/react-query";

import { fetcher, queryClient } from "@/api";
import {
  CreateIgnoreList,
  CreateIngoreListEntry,
  IdSlug,
  IgnoreList,
  IgnoreListEntry,
  Provider,
  Source,
  UpdateIgnoreList,
} from "@/types/backendTypes";

export const globalIgnoreListsQueryOptions = queryOptions({
  queryKey: ["ignoreLists", "global"],
  queryFn: async ({ signal }) => {
    const data = await fetcher.get<IgnoreList[]>("/ignoreLists/global", {
      signal,
    });

    data.map((list) => {
      queryClient.setQueryData(["ignoreLists", list.id], list);
    });

    return data;
  },
});

export function ignoreListSlugQueryOptions<T>(slug: T) {
  return queryOptions({
    queryKey: ["ignoreLists", "slugs", slug],
    queryFn: async ({ signal }) => {
      if (!slug) {
        return slug;
      }

      return await fetcher.get<string>(`/ignoreLists/slugs/${slug}`, {
        signal,
      });
    },
  });
}

export const ignoreListsQueryOptions = queryOptions({
  queryKey: ["ignoreLists"],
  queryFn: async ({ signal }) => {
    const data = await fetcher.get<IgnoreList[]>("/ignoreLists", {
      signal,
    });

    data.map((list) => {
      queryClient.setQueryData(["ignoreLists", list.id], list);
    });

    return data;
  },
});

export const ignoreListQueryOptions = (listId: string) =>
  queryOptions({
    queryKey: ["ignoreLists", listId],
    queryFn: async ({ signal }) =>
      await fetcher.get<IgnoreList>(`/ignoreLists/${listId}`, {
        signal,
      }),
  });

export const ignoreListEntriesQueryOptions = (listId: string) =>
  queryOptions({
    queryKey: ["ignoreLists", listId, "entries"],
    queryFn: async ({ signal }) =>
      await fetcher.get<IgnoreListEntry[]>(`/ignoreLists/${listId}/entries`, {
        signal,
      }),
  });

export const ignoreListSourcesQueryOptions = (listId: string) =>
  queryOptions({
    queryKey: ["ignoreLists", listId, "sources"],
    queryFn: async ({ signal }) =>
      await fetcher.get<Source[]>(`/ignoreLists/${listId}/sources`, {
        signal,
      }),
  });

export const ignoreListProvidersQueryOptions = (listId: string) =>
  queryOptions({
    queryKey: ["ignoreLists", listId, "providers"],
    queryFn: async ({ signal }) =>
      await fetcher.get<Provider[]>(`/ignoreLists/${listId}/providers`, {
        signal,
      }),
  });

export const useIgnoreListDelete = () =>
  useMutation({
    mutationFn: async (id: string) => {
      await fetcher.delete(`/ignoreLists/${id}`);
    },
    onSettled: async () =>
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["ignoreLists"] }),
        queryClient.invalidateQueries({ queryKey: ["stats", "count"] }),
      ]),
  });

interface IgnoreListPatch {
  id: string;
  data: UpdateIgnoreList;
}

export const useIgnoreListPatch = () =>
  useMutation({
    mutationFn: async ({ id, data }: IgnoreListPatch) => {
      await fetcher.patch(`/ignoreLists/${id}`, { data });
    },
    onSettled: async (_data, _error, { id }) =>
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["ignoreLists"] }),
        queryClient.invalidateQueries({ queryKey: ["ignoreLists", id] }),
        queryClient.invalidateQueries({ queryKey: ["stats", "count"] }),
      ]),
  });

export const useIgnoreListCreate = () =>
  useMutation({
    mutationFn: async (data: CreateIgnoreList) =>
      await fetcher.post<IdSlug>("/ignoreLists", { data }),
    onSettled: async () =>
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["ignoreLists"] }),
        queryClient.invalidateQueries({ queryKey: ["stats", "count"] }),
      ]),
  });

interface DeleteEntry {
  listId: string;
  data: CreateIngoreListEntry[];
}

export const useIgnoreListEntryPut = () =>
  useMutation({
    mutationFn: async ({ listId, data }: DeleteEntry) => {
      await fetcher.put(`/ignoreLists/${listId}/entries`, { data });
    },
    onSettled: async (_data, _error, { listId }) =>
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["ignoreLists", listId, "entries"],
        }),
        queryClient.invalidateQueries({ queryKey: ["stats", "count"] }),
      ]),
  });

interface IgnoreListSourcesPut {
  listId: string;
  data: string[];
}

export const useIgnoreListSourcesPut = () =>
  useMutation({
    mutationFn: async ({ listId, data }: IgnoreListSourcesPut) => {
      await fetcher.put(`/ignoreLists/${listId}/sources`, { data });
    },
    onSettled: async (_data, _error, { listId }) =>
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["ignoreLists", listId, "sources"],
        }),
        queryClient.invalidateQueries({ queryKey: ["stats", "count"] }),
      ]),
  });

export const useIgnoreListProvidersPut = () =>
  useMutation({
    mutationFn: async ({ listId, data }: IgnoreListSourcesPut) => {
      await fetcher.put(`/ignoreLists/${listId}/providers`, { data });
    },
    onSettled: async (_data, _error, { listId }) =>
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["ignoreLists", listId, "providers"],
        }),
        queryClient.invalidateQueries({ queryKey: ["stats", "count"] }),
      ]),
  });

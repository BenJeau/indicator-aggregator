import { queryOptions, useMutation } from "@tanstack/react-query";

import { fetcher } from "@/api";
import {
  ApiToken,
  CreateApiToken,
  UpdateApiToken,
  CreatedApiToken,
} from "@/types/backendTypes";
import { queryClient } from "@/lib/query";

export const userApiTokensQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: ["apiTokens", userId],
    queryFn: async ({ signal }) =>
      await fetcher.get<ApiToken[]>(`/users/${userId}/apiTokens`, {
        signal,
      }),
  });

export const useCreateApiTokenMutation = () =>
  useMutation({
    mutationFn: async (data: CreateApiToken) =>
      await fetcher.post<CreatedApiToken>("/apiTokens", { data }),
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["apiTokens"] });
    },
  });

export const useRegenerateApiTokenMutation = () =>
  useMutation({
    mutationFn: async (id: string) =>
      await fetcher.post<string>(`/apiTokens/${id}/regenerate`),
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["apiTokens"] });
    },
  });

interface ApiTokenPatch {
  id: string;
  data: UpdateApiToken;
}

export const useUpdateApiTokenMutation = () =>
  useMutation({
    mutationFn: async ({ id, data }: ApiTokenPatch) =>
      await fetcher.patch(`/apiTokens/${id}`, { data }),
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["apiTokens"] });
    },
  });

export const useDeleteApiTokenMutation = () =>
  useMutation({
    mutationFn: async (id: string) => await fetcher.delete(`/apiTokens/${id}`),
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["apiTokens"] });
    },
  });

export const useDeleteUserApiTokensMutation = () =>
  useMutation({
    mutationFn: async (userId: string) => {
      await fetcher.delete(`/users/${userId}/apiTokens`);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["apiTokens"] });
    },
  });

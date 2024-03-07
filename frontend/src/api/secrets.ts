import { queryOptions, useMutation } from "@tanstack/react-query";

import { fetcher, queryClient } from "@/api";
import {
  CreateSecret,
  SecretWithNumSources,
  UpdateSecret,
} from "@/types/backendTypes";

export const secretsQueryOptions = queryOptions({
  queryKey: ["secrets"],
  queryFn: async ({ signal }) =>
    await fetcher.get<SecretWithNumSources[]>("/secrets", {
      signal,
    }),
});

export const secretValueQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["secrets", id, "value"],
    queryFn: async ({ signal }) =>
      await fetcher.get<string>(`/secrets/${id}/value`, {
        signal,
      }),
    enabled: false,
  });

export const useCreateSecretMutation = () =>
  useMutation({
    mutationFn: async (data: CreateSecret) =>
      await fetcher.post("/secrets", { data }),
    onSettled: async () =>
      await queryClient.invalidateQueries({ queryKey: ["secrets"] }),
  });

export const useDeleteSecretMutation = () =>
  useMutation({
    mutationFn: async (id: string) => await fetcher.delete(`/secrets/${id}`),
    onSettled: async () =>
      await queryClient.invalidateQueries({ queryKey: ["secrets"] }),
  });

interface PatchSecretParams {
  id: string;
  data: UpdateSecret;
}

export const usePatchSecretMutation = () =>
  useMutation({
    mutationFn: async ({ id, data }: PatchSecretParams) =>
      await fetcher.patch(`/secrets/${id}`, { data }),
    onSettled: async () =>
      await queryClient.invalidateQueries({ queryKey: ["secrets"] }),
  });

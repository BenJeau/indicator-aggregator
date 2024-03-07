import { queryOptions, useMutation } from "@tanstack/react-query";

import { fetcher, queryClient } from "@/api";
import { ServerConfig, UpdateServerConfig } from "@/types/backendTypes";

const cleanConfigValue = (value?: string) =>
  value?.replace(/\\n/g, "\n").replace(/\\t/g, "\t").replace(/\\r/g, "\r");

export const configQueryOptions = queryOptions({
  queryKey: ["config"],
  queryFn: async ({ signal }) =>
    (
      await fetcher.get<ServerConfig[]>("/config", {
        signal,
      })
    ).map((config) => ({
      ...config,
      value: cleanConfigValue(config.value),
      defaultValue: cleanConfigValue(config.defaultValue)!,
    })),
});

export const useConfigUpdate = () =>
  useMutation({
    mutationFn: async (data: UpdateServerConfig[]) =>
      await fetcher.put("/config", { data }),
    onSettled: async () =>
      await queryClient.invalidateQueries({ queryKey: ["config"] }),
  });

import { queryOptions, useMutation } from "@tanstack/react-query";

import { fetcher, queryClient } from "@/api";
import { ServerConfig, UpdateServerConfig } from "@/types/backendTypes";

export const cleanConfigValue = (value?: string) =>
  value
    ?.toString()
    .replace(/\\n/g, "\n")
    .replace(/\\t/g, "\t")
    .replace(/\\r/g, "\r");

export const configQueryOptions = queryOptions({
  queryKey: ["config"],
  queryFn: async ({ signal }) => {
    const config = await fetcher.get<ServerConfig>("/config", {
      signal,
    });

    return Object.fromEntries(
      Object.entries(config).map(([key, value]) => [
        key,
        {
          ...value,
          value: cleanConfigValue(value.value),
          defaultValue: cleanConfigValue(value.defaultValue),
        },
      ])
    ) as ServerConfig;
  },
});

export const useConfigUpdate = () =>
  useMutation({
    mutationFn: async (data: UpdateServerConfig[]) =>
      await fetcher.put("/config", { data }),
    onSettled: async () =>
      await queryClient.invalidateQueries({ queryKey: ["config"] }),
  });

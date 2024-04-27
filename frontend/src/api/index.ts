import { QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import config from "@/config";
import { store } from "@/atoms";
import { userAtom } from "@/atoms/auth";
import { router } from "@/main";

type GenericOptions = {
  params?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

type DataOptions = GenericOptions & {
  data?: unknown;
  form?: FormData;
};

const axiosKiller = async <T>(
  endpoint: string,
  method: "POST" | "GET" | "PATCH" | "DELETE" | "PUT",
  options?: DataOptions
) => {
  const token = store.get(userAtom)?.token;

  const headers = {
    Authorization: `Bearer ${token}`,
    ...(options?.data ? { "Content-Type": "application/json" } : {}),
    ...(options?.headers ?? {}),
  };

  const body = options?.data
    ? headers["Content-Type"] === "application/json"
      ? JSON.stringify(options.data)
      : (options.data as string)
    : options?.form ?? undefined;

  const url =
    config.rest_server_base_url +
    endpoint +
    (options?.params
      ? "?" + new URLSearchParams(options.params as Record<string, string>)
      : "");

  const signals = [AbortSignal.timeout(30000)];
  if (options?.signal) signals.push(options.signal);

  const response = await fetch(url, {
    method,
    signal: anySignal(signals),
    headers,
    body,
    keepalive: true,
  });

  if (!response.ok) {
    const text = await response.text();

    const message = `${response.status} - ${response.statusText}${
      text && `: ${text}`
    }`;

    if (response.status === 401) {
      store.set(userAtom, undefined);
      toast("Authentication expired", {
        description: "Please login again",
      });
      router.navigate({
        to: "/login",
        search: {
          next: location.pathname,
        },
      });
    } else {
      toast.error("API response error", {
        description: message,
      });
    }

    throw new Error(message);
  }

  const contentType = response.headers.get("Content-Type");

  if (contentType === "application/json") {
    return (await response.json()) as T;
  }

  return await response.text();
};

export const fetcher = {
  get: <T>(endpoint: string, options?: GenericOptions) =>
    axiosKiller<T>(endpoint, "GET", options) as Promise<T>,
  post: <T>(endpoint: string, options?: DataOptions) =>
    axiosKiller<T>(endpoint, "POST", options) as Promise<T>,
  put: <T>(endpoint: string, options?: DataOptions) =>
    axiosKiller<T>(endpoint, "PUT", options) as Promise<T>,
  patch: <T>(endpoint: string, options?: DataOptions) =>
    axiosKiller<T>(endpoint, "PATCH", options) as Promise<T>,
  delete: <T>(endpoint: string, options?: DataOptions) =>
    axiosKiller<T>(endpoint, "DELETE", options),
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

function anySignal(signals: AbortSignal[]): AbortSignal {
  const controller = new AbortController();

  for (const signal of signals) {
    if (signal.aborted) {
      controller.abort();
      return signal;
    }

    signal.addEventListener("abort", () => controller.abort(signal.reason), {
      signal: controller.signal,
    });
  }

  return controller.signal;
}

import { queryOptions, useMutation } from "@tanstack/react-query";

import { fetcher } from "@/api";
import {
  DbUserLog,
  User,
  UserWithNumLogs,
  UpdateUser,
  Provider,
  Source,
  IgnoreList,
  Request,
} from "@/types/backendTypes";
import { queryClient } from "@/lib/query";

export const usersQueryOptions = queryOptions({
  queryKey: ["users"],
  queryFn: async ({ signal }) =>
    await fetcher.get<UserWithNumLogs[]>("/users", {
      signal,
    }),
});

export function userQueryOptions<T extends undefined | string>(userId: T) {
  return queryOptions({
    queryKey: ["users", userId],
    queryFn: async ({ signal }) => {
      if (userId == undefined) {
        return null;
      }

      return await fetcher.get<User>(`/users/${userId}`, {
        signal,
      });
    },
  });
}

export const userLogsQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: ["users", userId, "logs"],
    queryFn: async ({ signal }) =>
      await fetcher.get<DbUserLog[]>(`/users/${userId}/logs`, {
        signal,
      }),
  });

export const userRequestsQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: ["users", userId, "requests"],
    queryFn: async ({ signal }) =>
      await fetcher.get<Request[]>(`/users/${userId}/requests`, {
        signal,
      }),
  });

export const userSourcesQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: ["users", userId, "sources"],
    queryFn: async ({ signal }) =>
      await fetcher.get<Source[]>(`/users/${userId}/sources`, {
        signal,
      }),
  });

export const userProvidersQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: ["users", userId, "providers"],
    queryFn: async ({ signal }) =>
      await fetcher.get<Provider[]>(`/users/${userId}/providers`, {
        signal,
      }),
  });

export const userIgnoreListsQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: ["users", userId, "ignoreLists"],
    queryFn: async ({ signal }) =>
      await fetcher.get<IgnoreList[]>(`/users/${userId}/ignoreLists`, {
        signal,
      }),
  });

interface UserPatch {
  id: string;
  data: UpdateUser;
}

export const useUserPatch = () =>
  useMutation({
    mutationFn: async ({ id, data }: UserPatch) => {
      await fetcher.patch(`/users/${id}`, { data });
    },
    onSettled: async (_data, _error, { id }) =>
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["users"] }),
        queryClient.invalidateQueries({ queryKey: ["users", id] }),
      ]),
  });

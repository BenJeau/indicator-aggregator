import { queryOptions, useMutation } from "@tanstack/react-query";

import { fetcher, queryClient } from "@/api";
import {
  DbUserLog,
  User,
  UserWithNumLogs,
  UpdateUser,
} from "@/types/backendTypes";

export const usersQueryOptions = queryOptions({
  queryKey: ["users"],
  queryFn: async ({ signal }) =>
    await fetcher.get<UserWithNumLogs[]>("/users", {
      signal,
    }),
});

export const userQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: ["users", userId],
    queryFn: async ({ signal }) =>
      await fetcher.get<User>(`/users/${userId}`, {
        signal,
      }),
  });

export const userLogsQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: ["users", userId, "logs"],
    queryFn: async ({ signal }) =>
      await fetcher.get<DbUserLog[]>(`/users/${userId}/logs`, {
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

import { useMutation } from "@tanstack/react-query";

import { fetcher } from "@/api";
import {
  LoginUserRequest,
  LoginUserResponse,
  SignupUserRequest,
} from "@/types/backendTypes";

export const useUserLogin = () =>
  useMutation({
    mutationFn: async (data: LoginUserRequest) =>
      await fetcher.post<LoginUserResponse>("/auth/login", { data }),
  });

export const useUserSignup = () =>
  useMutation({
    mutationFn: async (data: SignupUserRequest) => {
      await fetcher.post("/auth/signup", { data });
    },
  });

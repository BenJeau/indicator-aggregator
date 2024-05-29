import { ParsedLocation, redirect } from "@tanstack/react-router";

import { userAtom } from "@/atoms/auth";
import { store } from "@/atoms";

export type BeforeLoadFn = (
  roles?: string[],
) => (opts: { location: ParsedLocation }) => void;

export const beforeLoadAuthenticated: BeforeLoadFn =
  (roles) =>
  ({ location }) => {
    const user = store.get(userAtom);

    if (!user) {
      throw redirect({
        to: "/auth/login",
        search: {
          next: location.pathname !== "/" ? location.pathname : undefined,
        },
      });
    }

    if (roles && roles.length > 0) {
      const hasRoles = user.roles.every((role) => roles.includes(role));

      if (!hasRoles) {
        throw redirect({ to: "/auth/login" });
      }
    }
  };

export const parseJwt = (token: string) => {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join(""),
  );

  return JSON.parse(jsonPayload);
};

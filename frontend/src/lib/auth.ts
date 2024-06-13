import { ParsedLocation, redirect } from "@tanstack/react-router";
import { toast } from "sonner";

import { User, userAtom } from "@/atoms/auth";
import { store } from "@/atoms";

export type BeforeLoadFn = (
  roles?: string[],
) => (opts: { location: ParsedLocation; cause?: string }) => void;

export const beforeLoadAuthenticated: BeforeLoadFn =
  (roles) =>
  ({ location, cause }) => {
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
      const hasRoles = userHasRoles(user, roles);

      if (!hasRoles) {
        if (cause !== "preload") {
          const missingRoles = roles
            .filter((role) => !user.roles.includes(role))
            .join(", ");
          toast.error(
            `You don't have the required roles to access the page ${window.location.pathname}`,
            {
              id: "no-roles" + missingRoles,
              description: "Missing roles: " + missingRoles,
            },
          );
        }

        throw redirect({ to: "/", replace: true });
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

export const userHasRoles = (user: User, roles?: string[]) =>
  !roles || roles.every((role) => user.roles.includes(role));

export const userHasAnyRoles = (user: User, roles?: string[]) =>
  !roles || roles.some((role) => user.roles.includes(role));

import { useSetAtom } from "jotai";
import { useEffect } from "react";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { userAtom } from "@/atoms/auth";
import { parseJwt } from "@/lib/auth";
import Trans from "@/components/trans";
import { useTranslation } from "@/i18n";
import { store } from "@/atoms";

const SaveUserData: React.FC = () => {
  const navigate = useNavigate();
  const setUser = useSetAtom(userAtom);
  const { t } = useTranslation();

  useEffect(() => {
    const search = new URLSearchParams(location.search);
    const token = search.get("token");
    const disabled = search.get("disabled");
    const next = search.get("next");

    setTimeout(() => {
      let error = null;
      if (token) {
        const claims = parseJwt(token);

        if (claims.name && claims.email && claims.sub) {
          let initials: string;
          if (claims.given_name && claims.family_name) {
            initials = claims.given_name[0] + claims.family_name;
          } else {
            initials = claims.name[0];
            const parts = claims.name.split(" ");
            if (parts.length > 1) {
              initials += parts[1][0];
            }
          }

          setUser({
            token,
            name: claims.name,
            givenName: claims.given_name,
            familyName: claims.family_name,
            email: claims.email,
            id: claims.sub,
            roles: claims.roles,
            initials: initials.toUpperCase(),
          });

          navigate({
            to: next || "/",
          });
          return;
        } else {
          error = "invalidToken";
        }
      }

      if (error === null) {
        error = disabled ? "disabled" : "missingToken";
      }

      let description = t("auth.error.token.missing");

      if (error === "disabled") {
        description = t("auth.error.disabled");
      } else if (error === "invalidToken") {
        description = t("auth.error.token.invalid");
      }

      toast(t("auth.error.title"), {
        description,
      });

      navigate({ to: "/auth/login" });
    }, 300);
  }, [navigate, setUser, t]);

  return (
    <div className="flex flex-1 flex-col items-center gap-2">
      <h1 className="flex animate-pulse items-center gap-2 text-2xl font-semibold tracking-tight">
        <Trans id="authenticating" />
        ...
      </h1>
      <p className="text-center text-sm text-muted-foreground">
        <Trans id="auth.validating.description" />
      </p>
    </div>
  );
};

export const Route = createFileRoute("/auth/")({
  component: SaveUserData,
  beforeLoad: () => {
    const user = store.get(userAtom);

    if (user) {
      throw redirect({ to: "/" });
    }
  },
});

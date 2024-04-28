import { useSetAtom } from "jotai";
import { Loader } from "lucide-react";
import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { userAtom } from "@/atoms/auth";
import { parseJwt } from "@/auth";
import Trans from "@/components/trans";

const SaveUserData: React.FC = () => {
  const navigate = useNavigate();
  const setUser = useSetAtom(userAtom);

  useEffect(() => {
    const search = new URLSearchParams(location.search);
    const token = search.get("token");
    const disabled = search.get("disabled");
    const next = search.get("next");

    if (token) {
      const claims = parseJwt(token);

      if (claims.name && claims.email && claims.sub) {
        setUser({
          token,
          name: claims.name,
          givenName: claims.given_name,
          familyName: claims.family_name,
          email: claims.email,
          id: claims.sub,
          roles: claims.roles,
        });

        navigate({
          to: next || "/",
        });
      } else {
        navigate({ to: "/login", params: { authError: "invalidToken" } });
      }
    } else {
      const error = disabled ? "disabled" : "missingToken";
      navigate({ to: "/login", params: { authError: error } });
    }
  }, [navigate, setUser]);

  return (
    <div className="absolute bottom-0 left-0 right-0 top-0 flex h-screen w-screen flex-col items-center">
      <Loader className="animate-spin" /> <Trans id="authenticating" />
      ...
    </div>
  );
};

export const Route = createFileRoute("/auth")({
  component: SaveUserData,
});

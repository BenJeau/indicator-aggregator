import {
  Link,
  createFileRoute,
  redirect,
  useNavigate,
} from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import config from "@/lib/config";
import { Forms, Icons, Trans } from "@/components";
import { store } from "@/atoms";
import { userAtom } from "@/atoms/auth";
import { authServicesQueryOptions, useUserLogin } from "@/api/auth";

const Login: React.FC = () => {
  const { next } = Route.useSearch();

  const query = next ? `?next=${next}` : "";

  const login = useUserLogin();
  const navigate = useNavigate();
  const authServices = useSuspenseQuery(authServicesQueryOptions);

  const handleOnSubmit = async (data: Forms.Login.FormSchema) => {
    const { jwtToken } = await login.mutateAsync(data);

    navigate({
      to: "/auth/",
      search: {
        token: jwtToken,
        next: next,
      },
    });
  };

  const getOpenIdAuthService = (name: string) =>
    authServices.data.find(
      (i) => i.kind.kind === "openId" && i.kind.content.name === name,
    );

  const googleEnabled = getOpenIdAuthService("google")?.enabled;
  const microsoftEnabled = getOpenIdAuthService("google")?.enabled;

  return (
    <>
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          <Trans id="login" />
        </h1>
        <p className="text-muted-foreground text-sm">
          <Trans id="authentication.description" />
        </p>
      </div>
      <div className="grid gap-2">
        {googleEnabled && (
          <Button type="button" className="gap-2" asChild variant="outline">
            <a
              href={`${config.rest_server_base_url}/auth/openid/google${query}`}
            >
              <Icons.Google />
              Google
            </a>
          </Button>
        )}
        {microsoftEnabled && (
          <Button type="button" className="gap-2" asChild variant="outline">
            <a
              href={`${config.rest_server_base_url}/auth/openid/microsoft${query}`}
            >
              <Icons.Microsoft />
              Microsoft
            </a>
          </Button>
        )}
        {(microsoftEnabled || googleEnabled) && (
          <div className="relative my-8 flex items-center justify-center">
            <hr className="flex-1" />
            <div className="self-center italic text-muted-foreground text-xs absolute text-center bg-background px-6">
              <Trans id="login.alternative.description" />
            </div>
          </div>
        )}
        <Forms.Login.default
          onSubmit={handleOnSubmit}
          loading={login.isPending}
          error={login.isError}
        />
        <p className="text-xs text-center text-muted-foreground mt-2">
          <Trans
            id="login.signup.description"
            link={
              <Link
                className="underline text-primary"
                to={"/auth/signup"}
                search={{ next }}
              >
                <Trans id="signup.here" />
              </Link>
            }
          />
        </p>
      </div>
    </>
  );
};

type SearchParams = {
  next?: string;
};

export const Route = createFileRoute("/auth/login")({
  component: Login,
  beforeLoad: () => {
    const user = store.get(userAtom);

    if (user) {
      throw redirect({ to: "/" });
    }
  },
  validateSearch: ({ next }: SearchParams): SearchParams => ({
    next: next && next !== "/" ? next : undefined,
  }),
  loader: async ({ context: { queryClient } }) =>
    await queryClient.ensureQueryData(authServicesQueryOptions),
});

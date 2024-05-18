import {
  Link,
  createFileRoute,
  redirect,
  useNavigate,
} from "@tanstack/react-router";
import { toast } from "sonner";

import { useUserSignup } from "@/api/auth";
import { Forms, Trans } from "@/components";
import { store } from "@/atoms";
import { userAtom } from "@/atoms/auth";

const Signup: React.FC = () => {
  const { next } = Route.useSearch();

  const signup = useUserSignup();

  const navigate = useNavigate();

  const handleOnSubmit = async (data: Forms.Signup.FormSchema) => {
    await signup.mutateAsync(data);

    toast(<Trans id="user.created.title" />, {
      description: <Trans id="user.created.description" />,
    });

    navigate({
      to: "/auth/login",
      search: {
        next,
      },
    });
  };

  return (
    <>
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          <Trans id="signup" />
        </h1>
        <p className="text-muted-foreground text-sm">
          <Trans id="signup.description" />
        </p>
      </div>
      <div className="grid gap-2">
        <Forms.Signup.default
          onSubmit={handleOnSubmit}
          loading={signup.isPending}
        />
        <p className="text-xs text-center text-muted-foreground mt-2">
          <Trans
            id="signup.login.description"
            link={
              <Link
                className="underline text-primary"
                to="/auth/login"
                search={{ next }}
              >
                <Trans id="login.here" />
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

export const Route = createFileRoute("/auth/signup")({
  component: Signup,
  beforeLoad: () => {
    const user = store.get(userAtom);

    if (user) {
      throw redirect({ to: "/" });
    }
  },
  validateSearch: ({ next }: SearchParams): SearchParams => ({
    next: next && next !== "/" ? next : undefined,
  }),
});

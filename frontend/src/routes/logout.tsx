import { createFileRoute, redirect } from "@tanstack/react-router";
import { toast } from "sonner";

import { userAtom } from "@/atoms/auth";
import { store } from "@/atoms";
import { Trans } from "@/components";

export const Route = createFileRoute("/logout")({
  beforeLoad: async ({ context: { queryClient } }) => {
    queryClient.clear();
    store.set(userAtom, undefined);
    toast(<Trans id="logged.out" />, {
      description: <Trans id="logged.out.description" />,
    });
    throw redirect({ to: "/login", replace: true });
  },
});

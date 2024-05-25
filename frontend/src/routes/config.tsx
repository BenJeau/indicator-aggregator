import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useAtomValue } from "jotai";

import { secretsQueryOptions } from "@/api/secrets";
import { configQueryOptions } from "@/api/config";
import { Separator } from "@/components/ui/separator";
import {
  SecretsTable,
  GeneralServerConfig,
  ApiTokensTable,
} from "@/components";
import { beforeLoadAuthenticated } from "@/lib/auth";
import { userApiTokensQueryOptions } from "@/api/apiTokens";
import { userAtom } from "@/atoms/auth";
import { store } from "@/atoms";

const ConfigComponent: React.FC = () => {
  const user = useAtomValue(userAtom);

  const secrets = useSuspenseQuery(secretsQueryOptions);
  const config = useSuspenseQuery(configQueryOptions);
  const apiTokens = useSuspenseQuery(userApiTokensQueryOptions(user!.id));

  return (
    <div className="flex flex-col gap-2 p-4">
      <ApiTokensTable apiTokens={apiTokens.data} />
      <Separator className="mt-4 mb-2" />
      <SecretsTable secrets={secrets.data} />
      <Separator className="mt-4" />
      <GeneralServerConfig config={config.data} />
    </div>
  );
};

export const Route = createFileRoute("/config")({
  component: ConfigComponent,
  beforeLoad: beforeLoadAuthenticated(),
  loader: async ({ context: { queryClient } }) =>
    await Promise.all([
      queryClient.ensureQueryData(secretsQueryOptions),
      queryClient.ensureQueryData(configQueryOptions),
      queryClient.ensureQueryData(
        userApiTokensQueryOptions(store.get(userAtom)!.id),
      ),
    ]),
});

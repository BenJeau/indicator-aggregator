import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";

import { secretsQueryOptions } from "@/api/secrets";
import { configQueryOptions } from "@/api/config";
import { Separator } from "@/components/ui/separator";
import SecretsTable from "@/components/secrets-table";
import GeneralServerConfig from "@/components/general-server-config";

const ConfigComponent: React.FC = () => {
  const secrets = useSuspenseQuery(secretsQueryOptions);
  const config = useSuspenseQuery(configQueryOptions);

  const [showForm, setShowForm] = useState(false);

  return (
    <div className="flex flex-col gap-2 p-4">
      <SecretsTable
        secrets={secrets.data}
        showForm={showForm}
        setShowForm={setShowForm}
      />
      <Separator className="mt-4" />
      <GeneralServerConfig config={config.data} />
    </div>
  );
};

export const Route = createFileRoute("/config")({
  component: ConfigComponent,
  loader: async ({ context: { queryClient } }) =>
    await Promise.all([
      queryClient.ensureQueryData(secretsQueryOptions),
      queryClient.ensureQueryData(configQueryOptions),
    ]),
});

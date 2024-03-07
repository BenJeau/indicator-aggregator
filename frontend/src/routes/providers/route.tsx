import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";

import { providersQueryOptions } from "@/api/providers";
import ProviderSearchResult from "@/components/provider-search-result";
import GenericPanelSearch from "@/components/generic-panel-search";

const ProvidersComponent: React.FC = () => {
  const providers = useSuspenseQuery(providersQueryOptions);

  return (
    <GenericPanelSearch
      data={providers.data}
      onFilter={(data, searchValue) =>
        data.name.toLowerCase().includes(searchValue.toLowerCase())
      }
      searchPlaceholder="Search providers..."
      createLinkTo="/providers/new"
      Item={ProviderSearchResult}
      empty={{
        title: "No providers",
        description: "Create a new provider to get started",
        extra: "Create provider",
      }}
    />
  );
};

export const Route = createFileRoute("/providers")({
  component: ProvidersComponent,
  loader: (opts) =>
    opts.context.queryClient.ensureQueryData(providersQueryOptions),
});

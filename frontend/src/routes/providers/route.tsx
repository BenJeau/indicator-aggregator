import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";

import { providersQueryOptions } from "@/api/providers";
import { GenericPanelSearch, SearchResults, Trans } from "@/components";
import { beforeLoadAuthenticated } from "@/lib/auth";

const ProvidersComponent: React.FC = () => {
  const providers = useSuspenseQuery(providersQueryOptions);

  return (
    <GenericPanelSearch
      data={providers.data}
      onFilter={(data, searchValue) =>
        data.name.toLowerCase().includes(searchValue.toLowerCase())
      }
      searchPlaceholder="providers.search.placeholder"
      createLinkTo="/providers/new"
      Item={SearchResults.Provider}
      empty={{
        title: "providers.search.empty.title",
        description: "providers.search.empty.description",
        extra: <Trans id="providers.search.empty.extra" />,
      }}
    />
  );
};

export const Route = createFileRoute("/providers")({
  component: ProvidersComponent,
  beforeLoad: beforeLoadAuthenticated(),
  loader: (opts) =>
    opts.context.queryClient.ensureQueryData(providersQueryOptions),
});

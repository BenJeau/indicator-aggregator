import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";

import { sourcesQueryOptions } from "@/api/sources";
import { GenericPanelSearch, SearchResults, Trans } from "@/components";
import { beforeLoadAuthenticated } from "@/auth";

const SourcesComponents: React.FC = () => {
  const sources = useSuspenseQuery(sourcesQueryOptions);

  return (
    <GenericPanelSearch
      data={sources.data}
      onFilter={(data, searchValue) =>
        data.name.toLowerCase().includes(searchValue.toLowerCase())
      }
      searchPlaceholder="sources.search.placeholder"
      createLinkTo="/sources/new"
      Item={SearchResults.Source}
      empty={{
        title: "sources.search.empty.title",
        description: "sources.search.empty.description",
        extra: <Trans id="sources.search.empty.extra" />,
      }}
    />
  );
};

export const Route = createFileRoute("/sources")({
  component: SourcesComponents,
  beforeLoad: beforeLoadAuthenticated(),
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(sourcesQueryOptions),
});

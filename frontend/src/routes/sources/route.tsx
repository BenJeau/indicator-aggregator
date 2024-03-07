import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";

import { sourcesQueryOptions } from "@/api/sources";
import GenericPanelSearch from "@/components/generic-panel-search";
import SourceSearchResult from "@/components/source-search-result";

const SourcesComponents: React.FC = () => {
  const sources = useSuspenseQuery(sourcesQueryOptions);

  return (
    <GenericPanelSearch
      data={sources.data}
      onFilter={(data, searchValue) =>
        data.name.toLowerCase().includes(searchValue.toLowerCase())
      }
      searchPlaceholder="Search sources..."
      createLinkTo="/sources/new"
      Item={SourceSearchResult}
      empty={{
        title: "No sources",
        description: "Create a new source to get started",
        extra: "Create source",
      }}
    />
  );
};

export const Route = createFileRoute("/sources")({
  component: SourcesComponents,
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(sourcesQueryOptions),
});

import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";

import { sourcesQueryOptions } from "@/api/sources";
import { GenericPanelSearch, SearchResults } from "@/components";
import { beforeLoadAuthenticated } from "@/auth";

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
      Item={SearchResults.Source}
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
  beforeLoad: beforeLoadAuthenticated(),
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(sourcesQueryOptions),
});

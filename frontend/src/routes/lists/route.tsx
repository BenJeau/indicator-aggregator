import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";

import { GenericPanelSearch, SearchResults } from "@/components";
import { ignoreListsQueryOptions } from "@/api/ignoreLists";
import { beforeLoadAuthenticated } from "@/auth";

const ListsComponent: React.FC = () => {
  const sources = useSuspenseQuery(ignoreListsQueryOptions);

  return (
    <GenericPanelSearch
      data={sources.data}
      onFilter={(data, searchValue) =>
        data.name.toLowerCase().includes(searchValue.toLowerCase())
      }
      searchPlaceholder="Search ignore lists..."
      createLinkTo="/lists/new"
      Item={SearchResults.List}
      empty={{
        title: "No ignore lists",
        description: "Create a new ignore list to get started",
        extra: "Create ignore list",
      }}
    />
  );
};

export const Route = createFileRoute("/lists")({
  component: ListsComponent,
  beforeLoad: beforeLoadAuthenticated(),
  loader: (opts) =>
    opts.context.queryClient.ensureQueryData(ignoreListsQueryOptions),
});

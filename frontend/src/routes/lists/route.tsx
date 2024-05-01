import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";

import { GenericPanelSearch, SearchResults, Trans } from "@/components";
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
      searchPlaceholder="ignore.list.search.placeholder"
      createLinkTo="/lists/new"
      Item={SearchResults.List}
      empty={{
        title: "ignore.list.search.empty.title",
        description: "ignore.list.search.empty.description",
        extra: <Trans id="ignore.list.search.empty.extra" />,
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

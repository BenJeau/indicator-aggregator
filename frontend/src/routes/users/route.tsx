import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";

import { GenericPanelSearch, SearchResults } from "@/components";
import { usersQueryOptions } from "@/api/users";
import { beforeLoadAuthenticated } from "@/lib/auth";

const UsersComponent: React.FC = () => {
  const users = useSuspenseQuery(usersQueryOptions);

  return (
    <GenericPanelSearch
      data={users.data}
      onFilter={(data, searchValue) =>
        data.user.name.toLowerCase().includes(searchValue.toLowerCase())
      }
      searchPlaceholder="users.search.palceholder"
      Item={SearchResults.User}
      empty={{
        title: "users.search.empty.title",
        description: "users.search.empty.description",
      }}
    />
  );
};

export const Route = createFileRoute("/users")({
  component: UsersComponent,
  beforeLoad: beforeLoadAuthenticated(),
  loader: (opts) => opts.context.queryClient.ensureQueryData(usersQueryOptions),
});

import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";

import { GenericPanelSearch, SearchResults } from "@/components";
import { usersQueryOptions } from "@/api/users";

const UsersComponent: React.FC = () => {
  const users = useSuspenseQuery(usersQueryOptions);

  return (
    <GenericPanelSearch
      data={users.data}
      onFilter={(data, searchValue) =>
        data.name.toLowerCase().includes(searchValue.toLowerCase())
      }
      searchPlaceholder="Search users..."
      Item={SearchResults.User}
      empty={{
        title: "No users",
        description: "Broaden your search criteria or create a new user",
      }}
    />
  );
};

export const Route = createFileRoute("/users")({
  component: UsersComponent,
  loader: (opts) => opts.context.queryClient.ensureQueryData(usersQueryOptions),
});

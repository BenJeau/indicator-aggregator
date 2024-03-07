import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Send } from "lucide-react";

import { requestsQueryOptions } from "@/api/requests";
import GenericPanelSearch from "@/components/generic-panel-search";
import HistorySearchResult from "@/components/history-search-result";

const SourcesComponents: React.FC = () => {
  const requests = useSuspenseQuery(requestsQueryOptions);

  return (
    <GenericPanelSearch
      data={requests.data}
      onFilter={(data, searchValue) =>
        data.data.toLowerCase().includes(searchValue.toLowerCase()) ||
        data.kind.toLowerCase().includes(searchValue.toLowerCase())
      }
      searchPlaceholder="Search past requests..."
      createLinkTo="/request"
      CreateLinkIcon={Send}
      Item={HistorySearchResult}
      empty={{
        title: "No past request",
        description: "Create a request to see it here",
        extra: "Send a request",
      }}
    />
  );
};

export const Route = createFileRoute("/history")({
  component: SourcesComponents,
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(requestsQueryOptions),
});

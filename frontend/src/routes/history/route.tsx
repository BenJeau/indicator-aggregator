import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Send } from "lucide-react";

import { requestsQueryOptions } from "@/api/requests";
import { GenericPanelSearch, SearchResults } from "@/components";
import { beforeLoadAuthenticated } from "@/auth";
import { useTranslation } from "@/i18n";

const SourcesComponents: React.FC = () => {
  const requests = useSuspenseQuery(requestsQueryOptions);
  const { t } = useTranslation();

  return (
    <GenericPanelSearch
      data={requests.data}
      onFilter={(data, searchValue) =>
        data.data.toLowerCase().includes(searchValue.toLowerCase()) ||
        data.kind.toLowerCase().includes(searchValue.toLowerCase())
      }
      searchPlaceholder="history.search.placeholder"
      createLinkTo="/request"
      CreateLinkIcon={Send}
      Item={SearchResults.History}
      empty={{
        title: "history.search.empty.title",
        description: "history.search.empty.description",
        extra: t("history.search.empty.extra"),
      }}
    />
  );
};

export const Route = createFileRoute("/history")({
  component: SourcesComponents,
  beforeLoad: beforeLoadAuthenticated(),
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(requestsQueryOptions),
});

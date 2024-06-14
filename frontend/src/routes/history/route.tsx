import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Send } from "lucide-react";
import { useAtomValue } from "jotai";

import { requestsQueryOptions } from "@/api/requests";
import { GenericPanelSearch, SearchResults } from "@/components";
import { beforeLoadAuthenticated, userHasRoles } from "@/lib/auth";
import { useTranslation } from "@/i18n";
import { userAtom } from "@/atoms/auth";

const SourcesComponents: React.FC = () => {
  const user = useAtomValue(userAtom);
  const requests = useSuspenseQuery(requestsQueryOptions);
  const { t } = useTranslation();

  const userHasRequestCreateRole = userHasRoles(user!, ["request_create"]);

  return (
    <GenericPanelSearch
      data={requests.data}
      onFilter={(data, searchValue) =>
        data.data.toLowerCase().includes(searchValue.toLowerCase()) ||
        data.kind.toLowerCase().includes(searchValue.toLowerCase())
      }
      searchPlaceholder="history.search.placeholder"
      createLinkTo={userHasRequestCreateRole ? "/request" : undefined}
      createLinkToDataKey="data"
      CreateLinkIcon={Send}
      Item={SearchResults.History}
      empty={{
        title: "history.search.empty.title",
        description: userHasRequestCreateRole
          ? "history.search.empty.description"
          : "history.search.empty.description.viewer",
        extra: t("history.search.empty.extra"),
      }}
    />
  );
};

export const Route = createFileRoute("/history")({
  component: SourcesComponents,
  beforeLoad: beforeLoadAuthenticated(["request_view"]),
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(requestsQueryOptions),
});

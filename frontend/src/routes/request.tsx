import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";

import { IndicatorKind } from "@/types/backendTypes";
import { sourcesQueryOptions } from "@/api/sources";
import { RequestDataView, Forms } from "@/components";
import { ModifiedRequest, useRequest } from "@/api/requests";
import { beforeLoadAuthenticated } from "@/lib/auth";

const RequestComponent: React.FC = () => {
  const search = Route.useSearch();
  const navigate = useNavigate();

  const ref = useRef<Forms.RequestForm.Ref>(null);

  const sources = useSuspenseQuery(sourcesQueryOptions);

  const [mutationData, setMutationData] = useState<ModifiedRequest | undefined>(
    undefined,
  );

  const request = useRequest(mutationData);

  useEffect(() => {
    if (search.requestId && !mutationData) {
      navigate({
        to: "/history/$id",
        params: { id: search.requestId },
      });
      return;
    }

    if (search.kind !== undefined && search.kind in IndicatorKind) {
      ref.current?.form?.setValue(
        "indicatorKind",
        search.kind as IndicatorKind,
      );
    } else {
      ref.current?.form?.resetField("indicatorKind");
    }

    if (search.data && search.kind) {
      const sourcesWithNames = (search.sources
        ?.map((id) => ({
          id,
          name: sources.data.find(({ id: sourceId }) => sourceId === id)?.name,
        }))
        .filter((source) => source.name !== undefined) ?? []) as {
        id: string;
        name: string;
      }[];

      ref.current?.form?.setValue("indicator", search.data);
      ref.current?.form?.setValue("sources", sourcesWithNames);

      if (search.kind in IndicatorKind) {
        ref.current?.form?.setValue(
          "indicatorKind",
          search.kind as IndicatorKind,
        );
      }

      setMutationData({
        data: search.data,
        kind: search.kind as IndicatorKind,
        sources: sourcesWithNames,
      });
    } else if (search.data) {
      ref.current?.form?.setValue("indicator", search.data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, request.data]);

  useEffect(() => {
    if (request.data?.requestId) {
      navigate({
        to: "/request",
        replace: true,
        search: {
          ...search,
          requestId: request.data.requestId,
        },
      });
    }
  }, [request.data?.requestId, navigate, search]);

  return (
    <div className="relative flex flex-1 flex-col">
      <Forms.RequestForm.default
        ref={ref}
        sources={sources.data}
        canSubmit={!request.isFetching}
      />
      <RequestDataView
        data={request.data?.data}
        isFetching={request.isFetching}
      />
    </div>
  );
};

type IndicatorRequest = {
  data?: string;
  kind?: string;
  sources?: string[];
  requestId?: string;
};

export const Route = createFileRoute("/request")({
  component: RequestComponent,
  beforeLoad: beforeLoadAuthenticated(["request_create"]),
  validateSearch: (search: IndicatorRequest): IndicatorRequest => search,
  loader: async ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(sourcesQueryOptions),
});

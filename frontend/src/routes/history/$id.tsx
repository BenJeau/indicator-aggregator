import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";
import dayjs from "dayjs";

import {
  ReqestSSEData,
  requestDataQueryOptions,
  requestQueryOptions,
} from "@/api/requests";
import { SectionPanelHeader, RequestDataView } from "@/components";
import { Button } from "@/components/ui/button";
import config from "@/config";
import { Badge } from "@/components/ui/badge";
import { DataCacheAction, SourceError } from "@/types/backendTypes";
import { beforeLoadAuthenticated } from "@/auth";

const HistoryComponent: React.FC = () => {
  const { id } = Route.useParams();

  const request = useSuspenseQuery(requestQueryOptions(id));
  const requestData = useSuspenseQuery(requestDataQueryOptions(id));

  return (
    <>
      <SectionPanelHeader
        title={
          <div className="flex items-center gap-2">
            {request.data.data} <Badge>{request.data.kind}</Badge>
          </div>
        }
        description={dayjs.utc(request.data.createdAt).format("lll")}
        extra={
          <a
            href={`${config.opentel_url}/trace/${request.data.traceId}`}
            target="_blank"
            rel="noreferrer noopener"
          >
            <Button
              variant="secondary"
              className="gap-2"
              size="sm"
              type="button"
            >
              <ExternalLink size={16} />
              View related traces
            </Button>
          </a>
        }
      />
      <div className="overflow-y-auto">
        <RequestDataView
          data={requestData.data.reduce(
            (acc, data) => {
              acc[data.id] = {
                source: {
                  id: data.sourceId || "",
                  slug: data.sourceSlug,
                  name: data.sourceName,
                  url: data.sourceUrl,
                  favicon: data.sourceFavicon,
                },
                timing: {
                  startedAt: data.startedAt,
                  endedAt: data.endedAt,
                },
                cache: {
                  action: data.cacheAction as DataCacheAction,
                  cachedAt: data.cacheCachedAt,
                  expiresAt: data.cacheExpiresAt,
                  cacheKey: data.cacheKey,
                },
                hasSourceCode: true,
                errors: data.errors as SourceError[],
                data: data.data,
              };
              return acc;
            },
            {} as { [key: string]: ReqestSSEData },
          )}
        />
      </div>
    </>
  );
};

export const Route = createFileRoute("/history/$id")({
  component: HistoryComponent,
  beforeLoad: beforeLoadAuthenticated(),
  loader: async ({ context: { queryClient }, params: { id } }) => {
    await Promise.all([
      queryClient.ensureQueryData(requestQueryOptions(id)),
      queryClient.ensureQueryData(requestDataQueryOptions(id)),
    ]);
  },
});

import { Link, createFileRoute } from "@tanstack/react-router";
import {
  UseSuspenseQueryResult,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { ExternalLink, UserIcon } from "lucide-react";
import dayjs from "dayjs";

import {
  ReqestSSEData,
  requestDataQueryOptions,
  requestQueryOptions,
} from "@/api/requests";
import {
  SectionPanelHeader,
  RequestDataView,
  Trans,
  FullBadge,
  NotFound,
} from "@/components";
import { Button } from "@/components/ui/button";
import config from "@/lib/config";
import { Badge } from "@/components/ui/badge";
import { DataCacheAction, SourceError, User } from "@/types/backendTypes";
import { beforeLoadAuthenticated } from "@/lib/auth";
import { userQueryOptions } from "@/api/users";

const HistoryComponent: React.FC = () => {
  const { id } = Route.useParams();

  const request = useSuspenseQuery(requestQueryOptions(id));
  const requestData = useSuspenseQuery(requestDataQueryOptions(id));
  const user = useSuspenseQuery(
    userQueryOptions(request.data.userId),
  ) as UseSuspenseQueryResult<User>;

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
          <>
            <Link to="/users/$id" params={{ id: request.data.userId }}>
              <FullBadge
                value={user.data.name}
                Icon={UserIcon}
                label="requester"
                valueBadgeProps={{
                  variant: "secondary",
                }}
              />
            </Link>
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
                <Trans id="view.related.traces" />
              </Button>
            </a>
          </>
        }
      />
      <div className="overflow-y-auto">
        <RequestDataView
          data={requestData.data.reduce<Record<string, ReqestSSEData>>(
            (acc, data) => {
              acc[data.id] = {
                source: {
                  id: data.sourceId ?? "",
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
            {},
          )}
        />
      </div>
    </>
  );
};

const NotFoundHistory: React.FC = () => {
  const { id } = Route.useParams();
  return <NotFound title="request.not.found" data={id} />;
};

export const Route = createFileRoute("/history/$id")({
  component: HistoryComponent,
  notFoundComponent: NotFoundHistory,
  beforeLoad: beforeLoadAuthenticated(["request_view"]),
  loader: async ({ context: { queryClient }, params: { id } }) => {
    const [request] = await Promise.all([
      queryClient.ensureQueryData(requestQueryOptions(id)),
      queryClient.ensureQueryData(requestDataQueryOptions(id)),
    ]);
    await queryClient.ensureQueryData(userQueryOptions(request.userId));
  },
});

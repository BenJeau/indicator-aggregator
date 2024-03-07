import {
  Link,
  Outlet,
  createFileRoute,
  useMatches,
} from "@tanstack/react-router";
import {
  BarChart2,
  Book,
  CalendarClock,
  Check,
  Code2,
  Edit,
  Hash,
  Link2,
  Link2Off,
  Minus,
  Power,
  Sigma,
  Tags,
  TimerReset,
  X,
} from "lucide-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useMemo } from "react";

import {
  sourceIgnoreListsQueryOptions,
  sourceQueryOptions,
  sourceRequestsQueryOptions,
  sourceSecretsQueryOptions,
} from "@/api/sources";
import { SectionPanelHeader } from "@/components/section-panel-header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge, BadgeProps } from "@/components/ui/badge";
import { providerQueryOptions } from "@/api/providers";
import ProviderSearchResult from "@/components/provider-search-result";
import FullBadge from "@/components/FullBadge";
import TitleEntryCount from "@/components/title-entry-count";
import ListSearchResult from "@/components/list-search-result";
import { globalIgnoreListsQueryOptions } from "@/api/ignoreLists";
import { dedupeListOnId, sourceKindIconMapping } from "@/data";
import { Separator } from "@/components/ui/separator";
import { IndicatorKind, SourceSecret } from "@/types/backendTypes";
import HistorySearchResult from "@/components/history-search-result";

const SourceComponent: React.FC = () => {
  const { id } = Route.useParams();

  const source = useSuspenseQuery(sourceQueryOptions(id));
  const sourceIgnoreLists = useSuspenseQuery(sourceIgnoreListsQueryOptions(id));
  const globalIgnoreLists = useSuspenseQuery(globalIgnoreListsQueryOptions);
  const provider = useSuspenseQuery(
    providerQueryOptions(source.data.providerId)
  );
  const sourceSecrets = useSuspenseQuery(sourceSecretsQueryOptions(id));
  const sourceRequests = useSuspenseQuery(sourceRequestsQueryOptions(id));

  const combinedIgnoreLists = dedupeListOnId([
    ...sourceIgnoreLists.data,
    ...globalIgnoreLists.data,
  ]);

  const Icon = sourceKindIconMapping[source.data.kind];

  const matches = useMatches();
  const isEdit = useMemo(
    () => matches.some((i) => i.routeId === "/sources/$id/edit"),
    [matches]
  );

  const requiredSecret = sourceSecrets.data.filter((i) => i.required);
  const optionalSecret = sourceSecrets.data.filter((i) => !i.required);

  const firstTag = source.data.tags[0];
  const otherTags = source.data.tags.slice(1);

  return (
    <div className="relative flex h-full flex-1 flex-col">
      <SectionPanelHeader
        outerClassName={cn(
          isEdit && "blur-sm pointer-events-none select-none opacity-20"
        )}
        titleIcon={
          <div
            className={cn(
              "rounded-lg p-2",
              source.data.enabled ? "bg-green-500/20" : "bg-red-500/20"
            )}
          >
            <Power size={16} strokeWidth={2.54} />
          </div>
        }
        title={source.data.name}
        description={
          <>
            {source.data.description}
            {source.data.description.length === 0 && (
              <span className="italic opacity-50">no description</span>
            )}
          </>
        }
        extra={
          <Link to="/sources/$id/edit" params={{ id }}>
            <Button variant="ghost" className="gap-2" size="sm" type="button">
              <Edit size={16} />
              Edit
            </Button>
          </Link>
        }
      />
      <div className={cn(!isEdit && "overflow-y-scroll")}>
        <div className="flex flex-col gap-2 p-4">
          <div
            className={cn(
              "flex flex-1 flex-col gap-2 transition-all",
              isEdit && "pointer-events-none select-none opacity-20 blur-sm"
            )}
          >
            <div className="flex flex-wrap gap-2">
              <FullBadge
                Icon={CalendarClock}
                label="Created date"
                value={dayjs.utc(source.data.createdAt).local().format("LLL")}
              />
              <FullBadge
                Icon={CalendarClock}
                label="Updated date"
                value={dayjs.utc(source.data.updatedAt).local().format("LLL")}
              />
            </div>
            <Separator className="mt-2" />
            <div className="mt-2 flex flex-wrap gap-2">
              <FullBadge
                Icon={Code2}
                label="Kind"
                valueBadgeProps={{
                  variant: "secondary",
                }}
                value={
                  <>
                    <Icon width="16" className="dark:fill-white" />
                    {source.data.kind}
                  </>
                }
              />
              <FullBadge
                Icon={Book}
                label="Documentation"
                valueBadgeProps={{
                  variant: "secondary",
                }}
                value={
                  <a
                    href={source.data.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {source.data.url}
                  </a>
                }
              />
              {firstTag && (
                <FullBadge
                  Icon={Tags}
                  label="Tags"
                  valueBadgeProps={{
                    variant: "secondary",
                  }}
                  value={firstTag}
                />
              )}
              {otherTags.map((tag) => (
                <FullBadge
                  key={tag}
                  valueBadgeProps={{
                    variant: "secondary",
                  }}
                  value={tag}
                />
              ))}
            </div>
            <Separator className="mt-2" />

            <div className="mt-2 flex flex-wrap justify-between gap-2 ">
              <h2 className="flex items-center gap-2 font-medium">
                <Badge
                  className="gap-2"
                  variant={source.data.limitEnabled ? "success" : "destructive"}
                >
                  <Power size={14} strokeWidth={3} />
                  {source.data.limitEnabled ? "Enabled" : "Disabled"}
                </Badge>
                Limit
              </h2>
              <div className="flex flex-wrap justify-end gap-2 self-end">
                {source.data.limitCount && (
                  <FullBadge
                    Icon={Hash}
                    label="Limit of request per interval"
                    value={source.data.limitCount}
                  />
                )}
                {source.data.limitInterval && (
                  <FullBadge
                    Icon={TimerReset}
                    label="Reset interval"
                    value={source.data.limitInterval}
                  />
                )}
                <FullBadge
                  Icon={BarChart2}
                  label="Number of request during interval"
                  value={0}
                />
                <FullBadge
                  Icon={Sigma}
                  label="Total number of request"
                  value={0}
                />
              </div>
            </div>

            <div className="text-sm">
              {!source.data.limitEnabled && (
                <span className="text-xs italic opacity-50">no limit set</span>
              )}
            </div>

            <div className="flex justify-between gap-2">
              <h2 className="flex items-center gap-2 font-medium">
                <Badge
                  className="gap-2"
                  variant={source.data.taskEnabled ? "success" : "destructive"}
                >
                  <Power size={14} strokeWidth={3} />
                  {source.data.taskEnabled ? "Enabled" : "Disabled"}
                </Badge>
                Background task
              </h2>
              <div className="flex gap-2">
                {source.data.taskInterval && (
                  <FullBadge
                    Icon={TimerReset}
                    label="Interval"
                    value={source.data.taskInterval + "s"}
                  />
                )}
              </div>
            </div>

            <div className="text-sm">
              {!source.data.taskEnabled && (
                <span className="text-xs italic opacity-50">
                  no background task set
                </span>
              )}
            </div>

            <div className="flex justify-between gap-2">
              <h2 className="flex items-center gap-2 font-medium">
                <Badge
                  className="gap-2"
                  variant={source.data.cacheEnabled ? "success" : "destructive"}
                >
                  <Power size={14} strokeWidth={3} />
                  {source.data.cacheEnabled ? "Enabled" : "Disabled"}
                </Badge>
                Caching
              </h2>
              <div className="flex gap-2">
                {source.data.cacheInterval && (
                  <FullBadge
                    Icon={TimerReset}
                    label="Interval"
                    value={source.data.cacheInterval + "s"}
                  />
                )}
              </div>
            </div>

            <div className="text-sm">
              {!source.data.cacheEnabled && (
                <span className="text-xs italic opacity-50">no cache set</span>
              )}
            </div>
            <Separator />

            <div className="mt-2 flex flex-col justify-between gap-2">
              <h2 className="flex items-baseline gap-2 font-medium">
                Supported indicator kinds
              </h2>

              <div className="flex flex-wrap gap-2">
                {Object.entries(IndicatorKind).map(([key, value]) => {
                  const isSupported =
                    source.data.supportedIndicators.includes(value);
                  const isDisabled =
                    source.data.disabledIndicators.includes(value);

                  let variant: BadgeProps["variant"] = "secondary";
                  let Icon = Minus;

                  if (isSupported) {
                    if (isDisabled) {
                      variant = "destructive";
                      Icon = X;
                    } else {
                      variant = "success";
                      Icon = Check;
                    }
                  }

                  return (
                    <Badge key={key} variant={variant} className="gap-2">
                      <Icon size={14} strokeWidth={3} />
                      {value}
                    </Badge>
                  );
                })}
              </div>
            </div>
            <Separator className="mt-2" />
            <h2 className="mt-2 flex items-baseline gap-2 font-medium">
              Configuration
            </h2>

            <div className="text-sm">
              {source.data.config.length > 0 ? (
                <p>Interval {source.data.taskInterval}</p>
              ) : (
                <span className="text-xs italic opacity-50">
                  no extra configuration needed
                </span>
              )}
            </div>

            <h2 className="mt-2 flex items-baseline gap-2 font-medium">
              Secrets
            </h2>
            <div className="grid grid-cols-2 text-sm">
              <div>
                <h3 className="flex items-baseline gap-2">
                  Required
                  <TitleEntryCount count={requiredSecret.length} />
                </h3>
                <div className="mt-1">
                  {requiredSecret.map(SecretBadge)}

                  {requiredSecret.length === 0 && (
                    <span className="text-xs italic opacity-50">
                      no required env
                    </span>
                  )}
                </div>
              </div>
              <div>
                <h3 className="flex items-baseline gap-2">
                  Optional
                  <TitleEntryCount count={optionalSecret.length} />
                </h3>
                <div className="mt-1">
                  {optionalSecret.map(SecretBadge)}
                  {optionalSecret.length === 0 && (
                    <span className="text-xs italic opacity-50">
                      no optional env
                    </span>
                  )}
                </div>
              </div>
            </div>

            <Separator className="mt-2" />

            <h2 className="mt-2 flex items-baseline gap-2 font-medium">
              Linked provider
            </h2>
            {provider.data && <ProviderSearchResult data={provider.data} />}
            {!provider.data && (
              <span className="text-xs italic opacity-50">
                no linked provider
              </span>
            )}

            <h2 className="mt-2 flex items-baseline gap-2 font-medium">
              Ignore list
              <TitleEntryCount count={combinedIgnoreLists.length} />
            </h2>
            {combinedIgnoreLists.map((ignoreList) => (
              <ListSearchResult key={ignoreList.id} data={ignoreList} />
            ))}
            {combinedIgnoreLists.length === 0 && (
              <div className="text-xs italic opacity-50">
                no linked ignore lists
              </div>
            )}

            <Separator className="mt-2" />
            <h2 className="mt-2 flex items-baseline gap-2 font-medium">
              Requests
              <TitleEntryCount count={sourceRequests.data.length} />
            </h2>
            {sourceRequests.data.length === 0 && (
              <div className="text-xs italic opacity-50">no requests</div>
            )}
            <div className="grid grid-cols-3 gap-2">
              {sourceRequests.data.map((request) => (
                <HistorySearchResult key={request.id} data={request} />
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className={cn("absolute left-0 right-0 top-0", isEdit && "h-full")}>
        <Outlet />
      </div>
    </div>
  );
};

const SecretBadge: React.FC<SourceSecret> = ({ id, name, secretId }) => {
  let Icon = Link2Off;
  let variant: BadgeProps["variant"] = "destructive";

  if (secretId) {
    Icon = Link2;
    variant = "success";
  }
  return (
    <Badge variant={variant} key={id} className="gap-2">
      <Icon size={14} strokeWidth={3} /> {name}
    </Badge>
  );
};

export const Route = createFileRoute("/sources/$id")({
  component: SourceComponent,
  loader: async ({ context: { queryClient }, params: { id } }) => {
    await Promise.all([
      async () => {
        const { providerId } = await queryClient.ensureQueryData(
          sourceQueryOptions(id)
        );
        await queryClient.ensureQueryData(providerQueryOptions(providerId));
      },
      queryClient.ensureQueryData(sourceIgnoreListsQueryOptions(id)),
      queryClient.ensureQueryData(globalIgnoreListsQueryOptions),
      queryClient.ensureQueryData(sourceSecretsQueryOptions(id)),
      queryClient.ensureQueryData(sourceRequestsQueryOptions(id)),
    ]);
  },
});

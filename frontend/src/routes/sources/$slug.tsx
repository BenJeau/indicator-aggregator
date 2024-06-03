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
  sourceSlugQueryOptions,
} from "@/api/sources";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge, BadgeProps } from "@/components/ui/badge";
import { providerQueryOptions } from "@/api/providers";
import { globalIgnoreListsQueryOptions } from "@/api/ignoreLists";
import { dedupeListOnId, sourceKindIconMapping } from "@/lib/data";
import { Separator } from "@/components/ui/separator";
import { IndicatorKind, SourceKind, SourceSecret } from "@/types/backendTypes";
import {
  SectionPanelHeader,
  Editor,
  FullBadge,
  SearchResults,
  TitleEntryCount,
  Trans,
} from "@/components";
import { cleanConfigValue } from "@/api/config";
import { beforeLoadAuthenticated } from "@/lib/auth";

const SourceComponent: React.FC = () => {
  const { slug } = Route.useParams();

  const { data: id } = useSuspenseQuery(sourceSlugQueryOptions(slug));
  const source = useSuspenseQuery(sourceQueryOptions(id));
  const sourceIgnoreLists = useSuspenseQuery(sourceIgnoreListsQueryOptions(id));
  const globalIgnoreLists = useSuspenseQuery(globalIgnoreListsQueryOptions);
  const provider = useSuspenseQuery(
    providerQueryOptions(source.data.providerId),
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
    () => matches.some((i) => i.routeId === "/sources/$slug/edit"),
    [matches],
  );

  const requiredSecret = sourceSecrets.data.filter((i) => i.required);
  const optionalSecret = sourceSecrets.data.filter((i) => !i.required);

  const firstTag = source.data.tags[0];
  const otherTags = source.data.tags.slice(1);

  return (
    <div className="relative flex h-full flex-1 flex-col">
      <SectionPanelHeader
        outerClassName={cn(
          isEdit && "pointer-events-none select-none opacity-20 blur-sm",
        )}
        titleIcon={
          <div
            className={cn(
              "rounded-lg p-2",
              source.data.enabled ? "bg-green-500/20" : "bg-red-500/20",
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
              <span className="lowercase italic opacity-50">
                <Trans id="no.description" />
              </span>
            )}
          </>
        }
        extra={
          <Link to="/sources/$slug/edit" params={{ slug }}>
            <Button variant="ghost" className="gap-2" size="sm" type="button">
              <Edit size={16} />
              <Trans id="edit" />
            </Button>
          </Link>
        }
      />
      <div className={cn(!isEdit && "overflow-y-scroll")}>
        <div className="flex flex-col gap-2 p-4">
          <div
            className={cn(
              "flex flex-1 flex-col gap-2 transition-all",
              isEdit && "pointer-events-none select-none opacity-20 blur-sm",
            )}
          >
            <div className="flex flex-wrap gap-2">
              <FullBadge
                Icon={CalendarClock}
                label="created.date"
                value={dayjs.utc(source.data.createdAt).local().format("LLL")}
              />
              <FullBadge
                Icon={CalendarClock}
                label="updated.date"
                value={dayjs.utc(source.data.updatedAt).local().format("LLL")}
              />
            </div>
            <Separator className="mt-2" />
            <div className="mt-2 flex flex-wrap gap-2">
              <FullBadge
                Icon={Code2}
                label="kind"
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
                label="documentation"
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
                  label="tags"
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

            <div className="mt-2 flex flex-wrap justify-between gap-2">
              <h2 className="flex items-center gap-2 font-medium">
                <Badge
                  className="gap-2"
                  variant={source.data.limitEnabled ? "success" : "destructive"}
                >
                  <Power size={14} strokeWidth={3} />
                  <Trans
                    id={source.data.limitEnabled ? "enabled" : "disabled"}
                  />
                </Badge>
                <Trans id="limit" />
              </h2>
              <div className="flex flex-wrap justify-end gap-2 self-end">
                {source.data.limitCount && (
                  <FullBadge
                    Icon={Hash}
                    label="source.interval.limit"
                    value={source.data.limitCount}
                  />
                )}
                {source.data.limitInterval && (
                  <FullBadge
                    Icon={TimerReset}
                    label="source.interval.reset"
                    value={source.data.limitInterval}
                  />
                )}
                <FullBadge
                  Icon={BarChart2}
                  label="source.interval.number.request"
                  value={0}
                />
                <FullBadge
                  Icon={Sigma}
                  label="source.number.request"
                  value={0}
                />
              </div>
            </div>

            <div className="text-sm">
              {!source.data.limitEnabled && (
                <span className="text-xs lowercase italic opacity-50">
                  <Trans id="no.limit.set" />
                </span>
              )}
            </div>

            <div className="flex justify-between gap-2">
              <h2 className="flex items-center gap-2 font-medium">
                <Badge
                  className="gap-2"
                  variant={source.data.taskEnabled ? "success" : "destructive"}
                >
                  <Power size={14} strokeWidth={3} />
                  <Trans
                    id={source.data.taskEnabled ? "enabled" : "disabled"}
                  />
                </Badge>
                <Trans id="background.task" />
              </h2>
              <div className="flex gap-2">
                {source.data.taskInterval && (
                  <FullBadge
                    Icon={TimerReset}
                    label="interval"
                    value={source.data.taskInterval + "s"}
                  />
                )}
              </div>
            </div>

            <div className="text-sm">
              {!source.data.taskEnabled && (
                <span className="text-xs lowercase italic opacity-50">
                  <Trans id="no.background.task.set" />
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
                  <Trans
                    id={source.data.cacheEnabled ? "enabled" : "disabled"}
                  />
                </Badge>
                <Trans id="caching" />
              </h2>
              <div className="flex gap-2">
                {source.data.cacheInterval && (
                  <FullBadge
                    Icon={TimerReset}
                    label="interval"
                    value={source.data.cacheInterval + "s"}
                  />
                )}
              </div>
            </div>

            <div className="text-sm">
              {!source.data.cacheEnabled && (
                <span className="text-xs lowercase italic opacity-50">
                  <Trans id="no.cache.set" />
                </span>
              )}
            </div>
            <Separator />

            <div className="mt-2 flex flex-col justify-between gap-2">
              <h2 className="flex items-baseline gap-2 font-medium">
                <Trans id="supported.indicator.kinds" />
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
              <Trans id="secrets" />
            </h2>
            <div className="grid grid-cols-2 text-sm">
              <div>
                <h3 className="flex items-baseline gap-2">
                  <Trans id="required" />
                  <TitleEntryCount count={requiredSecret.length} />
                </h3>
                <div className="mt-1">
                  {requiredSecret.map(SecretBadge)}

                  {requiredSecret.length === 0 && (
                    <span className="text-xs lowercase italic opacity-50">
                      <Trans id="no.required.secrets" />
                    </span>
                  )}
                </div>
              </div>
              <div>
                <h3 className="flex items-baseline gap-2">
                  <Trans id="optional" />
                  <TitleEntryCount count={optionalSecret.length} />
                </h3>
                <div className="mt-1">
                  {optionalSecret.map(SecretBadge)}
                  {optionalSecret.length === 0 && (
                    <span className="text-xs lowercase italic opacity-50">
                      <Trans id="no.optional.secrets" />
                    </span>
                  )}
                </div>
              </div>
            </div>

            <Separator className="mt-2" />

            <h2 className="mt-2 flex items-baseline gap-2 font-medium">
              <Trans id="linked.provider" />
            </h2>
            {provider.data && <SearchResults.Provider data={provider.data} />}
            {!provider.data && (
              <span className="text-xs lowercase italic opacity-50">
                <Trans id="no.linked.provider" />
              </span>
            )}

            <h2 className="mt-2 flex items-baseline gap-2 font-medium">
              <Trans id="ignore.list" />
              <TitleEntryCount count={combinedIgnoreLists.length} />
            </h2>
            {combinedIgnoreLists.map((ignoreList) => (
              <SearchResults.List key={ignoreList.id} data={ignoreList} />
            ))}
            {combinedIgnoreLists.length === 0 && (
              <div className="text-xs lowercase italic opacity-50">
                <Trans id="no.linked.ignore.lists" />
              </div>
            )}

            {source.data.kind !== SourceKind.System && (
              <>
                <Separator className="mt-2" />
                <h2 className="mt-2 flex items-baseline gap-2 font-medium">
                  <Trans id="source.code" />
                </h2>
                <Editor
                  sourceKind={source.data.kind}
                  value={cleanConfigValue(source.data.sourceCode) ?? ""}
                />
              </>
            )}
            <Separator className="mt-2" />
            <h2 className="mt-2 flex items-baseline gap-2 font-medium">
              <Trans id="requests" />
              <TitleEntryCount count={sourceRequests.data.length} />
            </h2>
            {sourceRequests.data.length === 0 && (
              <div className="text-xs lowercase italic opacity-50">
                <Trans id="no.requests" />
              </div>
            )}
            <div className="grid grid-cols-3 gap-2">
              {sourceRequests.data.map((request) => (
                <SearchResults.History key={request.id} data={request} />
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

export const Route = createFileRoute("/sources/$slug")({
  component: SourceComponent,
  beforeLoad: beforeLoadAuthenticated(),
  loader: async ({ context: { queryClient }, params: { slug } }) => {
    const id = await queryClient.ensureQueryData(sourceSlugQueryOptions(slug));

    if (!id) {
      return;
    }

    await Promise.all([
      async () => {
        const { providerId } = await queryClient.ensureQueryData(
          sourceQueryOptions(id),
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

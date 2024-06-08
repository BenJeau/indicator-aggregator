import dayjs from "dayjs";
import {
  Link,
  Outlet,
  createFileRoute,
  useMatches,
} from "@tanstack/react-router";
import {
  Power,
  Edit,
  CalendarClock,
  Asterisk,
  UserIcon,
  UserCog,
} from "lucide-react";
import {
  UseSuspenseQueryResult,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useMemo } from "react";

import {
  ignoreListEntriesQueryOptions,
  ignoreListQueryOptions,
  ignoreListProvidersQueryOptions,
  ignoreListSourcesQueryOptions,
  ignoreListSlugQueryOptions,
} from "@/api/ignoreLists";
import {
  SectionPanelHeader,
  DataTable,
  SearchResults,
  TitleEntryCount,
  FullBadge,
  Trans,
} from "@/components";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { beforeLoadAuthenticated } from "@/lib/auth";
import { useTranslation } from "@/i18n";
import { userQueryOptions } from "@/api/users";
import { User } from "@/types/backendTypes";

const ListComponent = () => {
  const { slug } = Route.useParams();
  const { t } = useTranslation();

  const { data: id } = useSuspenseQuery(ignoreListSlugQueryOptions(slug));
  const ignoreList = useSuspenseQuery(ignoreListQueryOptions(id));
  const ignoreListEntries = useSuspenseQuery(ignoreListEntriesQueryOptions(id));
  const ignoreListSources = useSuspenseQuery(ignoreListSourcesQueryOptions(id));
  const ignoreListProviders = useSuspenseQuery(
    ignoreListProvidersQueryOptions(id),
  );
  const creator = useSuspenseQuery(
    userQueryOptions(ignoreList.data.createdUserId),
  ) as UseSuspenseQueryResult<User, Error>;
  const updater = useSuspenseQuery(
    userQueryOptions(ignoreList.data.updatedUserId),
  );

  const matches = useMatches();
  const isEdit = useMemo(
    () => matches.some((i) => i.routeId === "/lists/$slug/edit"),
    [matches],
  );

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
              ignoreList.data.enabled ? "bg-green-500/20" : "bg-red-500/20",
            )}
          >
            <Power size={16} strokeWidth={2.54} />
          </div>
        }
        title={ignoreList.data.name}
        description={
          <>
            {ignoreList.data.description}
            {ignoreList.data.description.length === 0 && (
              <span className="lowercase italic opacity-50">
                <Trans id="no.description" />
              </span>
            )}
          </>
        }
        extra={
          <Link to="/lists/$slug/edit" params={{ slug }}>
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
                value={dayjs
                  .utc(ignoreList.data.createdAt)
                  .local()
                  .format("LLL")}
              />
              <FullBadge
                Icon={CalendarClock}
                label="updated.date"
                value={dayjs
                  .utc(ignoreList.data.updatedAt)
                  .local()
                  .format("LLL")}
              />
            </div>
            <Separator className="mt-2" />
            <div className="mt-2 flex flex-wrap gap-2">
              <FullBadge
                Icon={Asterisk}
                label="global"
                valueBadgeProps={{
                  variant: ignoreList.data.global ? "success" : "destructive",
                }}
                value={ignoreList.data.global ? "yes" : "no"}
              />
              <Link to="/users/$id" params={{ id: creator.data.id }}>
                <FullBadge
                  value={creator.data.name}
                  Icon={UserIcon}
                  label="creator"
                  valueBadgeProps={{
                    variant: "secondary",
                  }}
                />
              </Link>
              {updater.data && (
                <Link to="/users/$id" params={{ id: updater.data.id }}>
                  <FullBadge
                    value={updater.data.name}
                    Icon={UserCog}
                    label="updater"
                    valueBadgeProps={{
                      variant: "secondary",
                    }}
                  />
                </Link>
              )}
            </div>
            <Separator className="mt-2" />
            <h2 className="mt-2 flex items-baseline gap-2 font-medium">
              <Trans id="linked.sources" />
              <TitleEntryCount count={ignoreListSources.data.length} />
            </h2>
            {ignoreList.data.global && (
              <div className="-mt-2 text-xs">
                <Trans id="global.linked.sources.description" />
              </div>
            )}
            {ignoreListSources.data.map((source) => (
              <SearchResults.Source key={source.id} data={source} />
            ))}
            {ignoreListSources.data.length === 0 && (
              <div className="text-xs lowercase italic opacity-50">
                <Trans id="no.linked.sources" />
              </div>
            )}
            <h2 className="mt-2 flex items-baseline gap-2 font-medium">
              <Trans id="linked.providers" />
              <TitleEntryCount count={ignoreListProviders.data.length} />
            </h2>
            {ignoreList.data.global && (
              <div className="-mt-2 text-xs">
                <Trans id="global.linked.providers.description" />
              </div>
            )}
            {ignoreListProviders.data.map((provider) => (
              <SearchResults.Provider key={provider.id} data={provider} />
            ))}
            {ignoreListProviders.data.length === 0 && (
              <div className="text-xs lowercase italic opacity-50">
                <Trans id="no.linked.providers" />
              </div>
            )}
            <Separator className="mt-2" />

            <h2 className="mt-2 flex items-baseline gap-2 font-medium">
              <Trans id="entries" />
              <TitleEntryCount count={ignoreListEntries.data.length} />
            </h2>
            <DataTable
              columns={[
                {
                  accessorKey: "data",
                  header: t("data"),
                  cell: ({ row }) => {
                    return (
                      <code className="rounded-sm bg-foreground/5 px-1 text-xs dark:bg-foreground/30">
                        {row.getValue("data")}
                      </code>
                    );
                  },
                },
                {
                  accessorKey: "indicatorKind",
                  header: t("kind"),
                  size: 50,
                  cell: ({ row }) => {
                    return <Badge>{row.getValue("indicatorKind")}</Badge>;
                  },
                },
              ]}
              data={ignoreListEntries.data}
            />
          </div>
        </div>
      </div>
      <div className={cn("absolute left-0 right-0 top-0", isEdit && "h-full")}>
        <Outlet />
      </div>
    </div>
  );
};

export const Route = createFileRoute("/lists/$slug")({
  component: ListComponent,
  beforeLoad: beforeLoadAuthenticated(),
  loader: async ({ context: { queryClient }, params: { slug } }) => {
    const id = await queryClient.ensureQueryData(
      ignoreListSlugQueryOptions(slug),
    );

    if (!id) {
      return;
    }

    await Promise.all([
      async () => {
        const list = await queryClient.ensureQueryData(
          ignoreListQueryOptions(id),
        );
        await Promise.all([
          queryClient.ensureQueryData(userQueryOptions(list.createdUserId)),
          queryClient.ensureQueryData(userQueryOptions(list.updatedUserId)),
        ]);
      },
      queryClient.ensureQueryData(ignoreListEntriesQueryOptions(id)),
      queryClient.ensureQueryData(ignoreListSourcesQueryOptions(id)),
      queryClient.ensureQueryData(ignoreListProvidersQueryOptions(id)),
    ]);
  },
});

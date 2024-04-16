import dayjs from "dayjs";
import {
  Link,
  Outlet,
  createFileRoute,
  useMatches,
} from "@tanstack/react-router";
import { Power, Edit, CalendarClock, Asterisk } from "lucide-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import {
  ignoreListEntriesQueryOptions,
  ignoreListQueryOptions,
  ignoreListProvidersQueryOptions,
  ignoreListSourcesQueryOptions,
  ignoreListSlugQueryOptions,
} from "@/api/ignoreLists";
import { SectionPanelHeader } from "@/components/section-panel-header";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/data-table";
import SourceSearchResult from "@/components/source-search-result";
import ProviderSearchResult from "@/components/provider-search-result";
import TitleEntryCount from "@/components/title-entry-count";
import FullBadge from "@/components/FullBadge";
import { Separator } from "@/components/ui/separator";

const ListComponent = () => {
  const { slug } = Route.useParams();

  const { data: id } = useSuspenseQuery(ignoreListSlugQueryOptions(slug));
  const ignoreList = useSuspenseQuery(ignoreListQueryOptions(id));
  const ignoreListEntries = useSuspenseQuery(ignoreListEntriesQueryOptions(id));
  const ignoreListSources = useSuspenseQuery(ignoreListSourcesQueryOptions(id));
  const ignoreListProviders = useSuspenseQuery(
    ignoreListProvidersQueryOptions(id),
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
          isEdit && "blur-sm pointer-events-none select-none opacity-20",
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
              <span className="italic opacity-50">no description</span>
            )}
          </>
        }
        extra={
          <Link to="/lists/$slug/edit" params={{ slug }}>
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
              isEdit && "pointer-events-none select-none opacity-20 blur-sm",
            )}
          >
            <div className="flex flex-wrap gap-2">
              <FullBadge
                Icon={CalendarClock}
                label="Created date"
                value={dayjs
                  .utc(ignoreList.data.createdAt)
                  .local()
                  .format("LLL")}
              />
              <FullBadge
                Icon={CalendarClock}
                label="Updated date"
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
                label="Global"
                valueBadgeProps={{
                  variant: ignoreList.data.global ? "success" : "destructive",
                }}
                value={ignoreList.data.global ? "Yes" : "No"}
              />
            </div>
            <Separator className="mt-2" />
            <h2 className="mt-2 flex items-baseline gap-2 font-medium">
              Linked sources
              <TitleEntryCount count={ignoreListSources.data.length} />
            </h2>
            {ignoreList.data.global && (
              <div className="-mt-2 text-xs">
                since list is global, <b>all</b> sources are affected, below are
                sources that would still be affected if not global
              </div>
            )}
            {ignoreListSources.data.map((source) => (
              <SourceSearchResult key={source.id} data={source} />
            ))}
            {ignoreListSources.data.length === 0 && (
              <div className="text-xs italic opacity-50">no linked sources</div>
            )}
            <h2 className="mt-2 flex items-baseline gap-2 font-medium">
              Linked providers
              <TitleEntryCount count={ignoreListProviders.data.length} />
            </h2>
            {ignoreList.data.global && (
              <div className="-mt-2 text-xs">
                since list is global, <b>all</b> providers are affected, below
                are providers that would still be affected if not global
              </div>
            )}
            {ignoreListProviders.data.map((provider) => (
              <ProviderSearchResult key={provider.id} data={provider} />
            ))}
            {ignoreListProviders.data.length === 0 && (
              <div className="text-xs italic opacity-50">
                no linked providers
              </div>
            )}
            <Separator className="mt-2" />

            <h2 className="mt-2 flex items-baseline gap-2 font-medium">
              Entries
              <TitleEntryCount count={ignoreListEntries.data.length} />
            </h2>
            <DataTable
              columns={[
                {
                  accessorKey: "data",
                  header: "Data",
                  cell: ({ row }) => {
                    return (
                      <code className="bg-foreground/5 dark:bg-foreground/30 rounded-sm px-1 text-xs">
                        {row.getValue("data")}
                      </code>
                    );
                  },
                },
                {
                  accessorKey: "indicatorKind",
                  size: 50,
                  header: "Kind",
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
  loader: async ({ context: { queryClient }, params: { slug } }) => {
    const id = await queryClient.ensureQueryData(
      ignoreListSlugQueryOptions(slug),
    );

    if (!id) {
      return;
    }

    await Promise.all([
      queryClient.ensureQueryData(ignoreListQueryOptions(id)),
      queryClient.ensureQueryData(ignoreListEntriesQueryOptions(id)),
      queryClient.ensureQueryData(ignoreListSourcesQueryOptions(id)),
      queryClient.ensureQueryData(ignoreListProvidersQueryOptions(id)),
    ]);
  },
});

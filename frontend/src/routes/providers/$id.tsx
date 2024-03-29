import {
  createFileRoute,
  Link,
  Outlet,
  useMatches,
} from "@tanstack/react-router";
import {
  useSuspenseQuery,
  UseSuspenseQueryResult,
} from "@tanstack/react-query";
import { Book, CalendarClock, Edit, Power, Tags } from "lucide-react";
import { useMemo } from "react";
import dayjs from "dayjs";

import {
  providerIgnoreListsQueryOptions,
  providerQueryOptions,
  providerSourcesQueryOptions,
} from "@/api/providers";
import { Button } from "@/components/ui/button";
import { SectionPanelHeader } from "@/components/section-panel-header";
import { cn } from "@/lib/utils";
import TitleEntryCount from "@/components/title-entry-count";
import { ProviderWithNumSources } from "@/types/backendTypes";
import ListSearchResult from "@/components/list-search-result";
import SourceSearchResult from "@/components/source-search-result";
import FullBadge from "@/components/FullBadge";
import { globalIgnoreListsQueryOptions } from "@/api/ignoreLists";
import { dedupeListOnId } from "@/data";
import { Separator } from "@/components/ui/separator";

const ProviderComponent: React.FC = () => {
  const { id } = Route.useParams();

  const provider = useSuspenseQuery(
    providerQueryOptions(id),
  ) as UseSuspenseQueryResult<ProviderWithNumSources, Error>;
  const providerIgnoreLists = useSuspenseQuery(
    providerIgnoreListsQueryOptions(id),
  );
  const providerSources = useSuspenseQuery(providerSourcesQueryOptions(id));
  const globalIgnoreLists = useSuspenseQuery(globalIgnoreListsQueryOptions);

  const combinedIgnoreLists = dedupeListOnId([
    ...providerIgnoreLists.data,
    ...globalIgnoreLists.data,
  ]);

  const matches = useMatches();
  const isEdit = useMemo(
    () => matches.some((i) => i.routeId === "/providers/$id/edit"),
    [matches],
  );

  const firstTag = provider.data.tags[0];
  const otherTags = provider.data.tags.slice(1);

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
              provider.data.enabled ? "bg-green-500/20" : "bg-red-500/20",
            )}
          >
            <Power size={16} strokeWidth={2.54} />
          </div>
        }
        title={provider.data.name}
        description={
          <>
            {provider.data.description}
            {provider.data.description.length === 0 && (
              <span className="italic opacity-50">no description</span>
            )}
          </>
        }
        extra={
          <Link to="/providers/$id/edit" params={{ id }}>
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
                value={dayjs.utc(provider.data.createdAt).local().format("LLL")}
              />
              <FullBadge
                Icon={CalendarClock}
                label="Updated date"
                value={dayjs.utc(provider.data.updatedAt).local().format("LLL")}
              />
            </div>
            <Separator className="mt-2" />
            <div className="mt-2 flex flex-wrap gap-2">
              <FullBadge
                Icon={Book}
                label="Documentation"
                valueBadgeProps={{
                  variant: "secondary",
                }}
                value={
                  <a
                    href={provider.data.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {provider.data.url}
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
            <h2 className="mt-2 flex items-baseline gap-2 font-medium">
              Sources
              <TitleEntryCount count={providerSources.data.length} />
            </h2>
            <div className="grid auto-cols-auto grid-cols-1 gap-2 lg:grid-cols-2 [&>*:nth-child(2n-1):nth-last-of-type(1)]:col-span-full">
              {providerSources.data.map((source) => (
                <SourceSearchResult key={source.id} data={source} />
              ))}
            </div>
            {providerSources.data.length === 0 && (
              <div className="text-xs italic opacity-50">no linked sources</div>
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
          </div>
        </div>
      </div>
      <div className={cn("absolute left-0 right-0 top-0", isEdit && "h-full")}>
        <Outlet />
      </div>
    </div>
  );
};

export const Route = createFileRoute("/providers/$id")({
  component: ProviderComponent,
  loader: async ({ context: { queryClient }, params: { id } }) => {
    await Promise.all([
      queryClient.ensureQueryData(providerQueryOptions(id)),
      queryClient.ensureQueryData(providerSourcesQueryOptions(id)),
      queryClient.ensureQueryData(providerIgnoreListsQueryOptions(id)),
      queryClient.ensureQueryData(globalIgnoreListsQueryOptions),
    ]);
  },
});

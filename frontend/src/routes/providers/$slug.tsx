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
import {
  Book,
  CalendarClock,
  Edit,
  Power,
  Tags,
  UserCog,
  UserIcon,
} from "lucide-react";
import { useMemo } from "react";
import dayjs from "dayjs";

import {
  providerIgnoreListsQueryOptions,
  providerQueryOptions,
  providerSlugQueryOptions,
  providerSourcesQueryOptions,
} from "@/api/providers";
import { globalIgnoreListsQueryOptions } from "@/api/ignoreLists";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  SectionPanelHeader,
  SearchResults,
  FullBadge,
  TitleEntryCount,
  Trans,
} from "@/components";
import { cn } from "@/lib/utils";
import { Provider, User } from "@/types/backendTypes";
import { dedupeListOnId } from "@/lib/data";
import { beforeLoadAuthenticated } from "@/lib/auth";
import { userQueryOptions } from "@/api/users";

const ProviderComponent: React.FC = () => {
  const { slug } = Route.useParams();

  const { data: id } = useSuspenseQuery(providerSlugQueryOptions(slug));
  const provider = useSuspenseQuery(
    providerQueryOptions(id),
  ) as UseSuspenseQueryResult<Provider, Error>;
  const providerIgnoreLists = useSuspenseQuery(
    providerIgnoreListsQueryOptions(id),
  );
  const providerSources = useSuspenseQuery(providerSourcesQueryOptions(id));
  const globalIgnoreLists = useSuspenseQuery(globalIgnoreListsQueryOptions);
  const creator = useSuspenseQuery(
    userQueryOptions(provider.data.createdUserId),
  ) as UseSuspenseQueryResult<User, Error>;
  const updater = useSuspenseQuery(
    userQueryOptions(provider.data.updatedUserId),
  );

  const combinedIgnoreLists = dedupeListOnId([
    ...providerIgnoreLists.data,
    ...globalIgnoreLists.data,
  ]);

  const matches = useMatches();
  const isEdit = useMemo(
    () => matches.some((i) => i.routeId === "/providers/$slug/edit"),
    [matches],
  );

  const firstTag = provider.data.tags[0];
  const otherTags = provider.data.tags.slice(1);

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
              <span className="lowercase italic opacity-50">
                <Trans id="no.description" />
              </span>
            )}
          </>
        }
        extra={
          <Link to="/providers/$slug/edit" params={{ slug }}>
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
                value={dayjs.utc(provider.data.createdAt).local().format("LLL")}
              />
              <FullBadge
                Icon={CalendarClock}
                label="updated.date"
                value={dayjs.utc(provider.data.updatedAt).local().format("LLL")}
              />
            </div>
            <Separator className="mt-2" />
            <div className="mt-2 flex flex-wrap gap-2">
              <FullBadge
                Icon={Book}
                label="documentation"
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
              <Trans id="sources" />
              <TitleEntryCount count={providerSources.data.length} />
            </h2>
            <div className="grid auto-cols-auto grid-cols-1 gap-2 lg:grid-cols-2 [&>*:nth-child(2n-1):nth-last-of-type(1)]:col-span-full">
              {providerSources.data.map((source) => (
                <SearchResults.Source key={source.id} data={source} />
              ))}
            </div>
            {providerSources.data.length === 0 && (
              <div className="text-xs lowercase italic opacity-50">
                <Trans id="no.linked.sources" />
              </div>
            )}

            <h2 className="mt-2 flex items-baseline gap-2 font-medium">
              <Trans id="ignore.lists" />
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
          </div>
        </div>
      </div>
      <div className={cn("absolute left-0 right-0 top-0", isEdit && "h-full")}>
        <Outlet />
      </div>
    </div>
  );
};

export const Route = createFileRoute("/providers/$slug")({
  component: ProviderComponent,
  beforeLoad: beforeLoadAuthenticated(),
  loader: async ({ context: { queryClient }, params: { slug } }) => {
    const id = await queryClient.ensureQueryData(
      providerSlugQueryOptions(slug),
    );

    if (!id) {
      return;
    }

    await Promise.all([
      async () => {
        const provider = await queryClient.ensureQueryData(
          providerQueryOptions(id),
        );
        await Promise.all([
          queryClient.ensureQueryData(
            userQueryOptions(provider!.createdUserId),
          ),
          queryClient.ensureQueryData(
            userQueryOptions(provider!.updatedUserId),
          ),
        ]);
      },
      queryClient.ensureQueryData(providerSourcesQueryOptions(id)),
      queryClient.ensureQueryData(providerIgnoreListsQueryOptions(id)),
      queryClient.ensureQueryData(globalIgnoreListsQueryOptions),
    ]);
  },
});

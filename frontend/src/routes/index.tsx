import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import {
  AreaChartIcon,
  Database,
  Globe,
  History,
  Scroll,
  Send,
  Server,
} from "lucide-react";
import { useAtomValue } from "jotai";

import { sourcesQueryOptions } from "@/api/sources";
import { Separator } from "@/components/ui/separator";
import {
  statsCountQueryOptions,
  statsCountRequestsByHourQueryOptions,
  statsCountRequestsByKindsQueryOptions,
  statsCountRequestsByProvidersQueryOptions,
  statsCountRequestsBySourcesQueryOptions,
} from "@/api/stats";
import { requestsQueryOptions } from "@/api/requests";
import { useRunnersStatus } from "@/api/runners";
import { SourceKind } from "@/types/backendTypes";
import { indicatorKindMapping } from "@/lib/data";
import { configQueryOptions } from "@/api/config";
import {
  RunnerStatus,
  StatsCounter,
  StackedAreaChart,
  SearchResults,
  Forms,
  Trans,
  AuthVisible,
} from "@/components";
import { beforeLoadAuthenticated } from "@/lib/auth";
import { userAtom } from "@/atoms/auth";
import { useTranslation } from "@/i18n";
import { store } from "@/atoms";
import React from "react";

const IndexComponent: React.FC = () => {
  const sources = useSuspenseQuery(sourcesQueryOptions);
  const statsCount = useSuspenseQuery(statsCountQueryOptions);
  const statsCountRequestsBySources = useSuspenseQuery(
    statsCountRequestsBySourcesQueryOptions,
  );
  const statsCountRequestsByProviders = useSuspenseQuery(
    statsCountRequestsByProvidersQueryOptions,
  );
  const statsCountRequestsByHour = useSuspenseQuery(
    statsCountRequestsByHourQueryOptions,
  );
  const statsCountRequestsByKinds = useSuspenseQuery(
    statsCountRequestsByKindsQueryOptions,
  );
  const user = useAtomValue(userAtom);

  const { t } = useTranslation();

  const config = useQuery(configQueryOptions);

  const runnersStatus = useRunnersStatus();

  return (
    <>
      <div className="p-4">
        <h3 className="text-xl font-semibold">
          <Trans id="welcome" /> {user?.name}!
        </h3>
        <p>
          <Trans id="home.welcome.description" />
        </p>
      </div>
      <div className="mx-4">
        <Separator />
      </div>
      <AuthVisible roles={["request_create"]}>
        <h4 className="z-20 mx-4 -mb-4 flex items-center gap-2 font-medium">
          <Send size={16} /> <Trans id="home.perform.request.title" />
        </h4>
        <Forms.RequestForm.default sources={sources.data} />
      </AuthVisible>
      <AuthVisible roles={["request_view"]}>
        <HistoryComponent />
      </AuthVisible>
      <div>
        <h4 className="z-20 mx-4 flex items-center gap-2 font-medium">
          <Server size={16} /> <Trans id="home.runners.title" />
        </h4>
        <div className="grid grid-cols-1 gap-4 p-4 lg:grid-cols-2">
          <RunnerStatus
            sourceKind={SourceKind.Python}
            status={runnersStatus.data?.PYTHON}
            address={config.data?.python_runner_grpc_address}
            enabled={config.data?.python_runner_enabled}
          />
          <RunnerStatus
            sourceKind={SourceKind.JavaScript}
            status={runnersStatus.data?.JAVA_SCRIPT}
            address={config.data?.javascript_runner_grpc_address}
            enabled={config.data?.javascript_runner_enabled}
          />
        </div>
      </div>
      <div className="mx-4">
        <Separator />
      </div>
      <div>
        <h4 className="z-20 mx-4 flex items-center gap-2 font-medium">
          <AreaChartIcon size={16} /> <Trans id="stats" />
        </h4>
        <div className="grid grid-cols-1 gap-4 p-4 lg:grid-cols-2 2xl:grid-cols-4">
          <StatsCounter
            Icon={Send}
            count={statsCount.data.history}
            title="home.stats.requests.title"
            subCount={statsCount.data.historyLast24hrs}
            subTitle="home.stats.requests.subtitle"
            to="/history"
            roles={["request_view"]}
          />
          <StatsCounter
            Icon={Database}
            count={statsCount.data.sources}
            title="home.stats.sources.title"
            subCount={statsCount.data.enabledSources}
            subTitle="home.stats.sources.subtitle"
            to="/sources"
          />
          <StatsCounter
            Icon={Globe}
            count={statsCount.data.providers}
            title="home.stats.providers.title"
            subCount={statsCount.data.enabledProviders}
            subTitle="home.stats.providers.subtitle"
            to="/providers"
          />
          <StatsCounter
            Icon={Scroll}
            count={statsCount.data.ignoreLists}
            title="home.stats.ignore.lists.title"
            subCount={statsCount.data.enabledIgnoreLists}
            subTitle="home.stats.ignore.lists.subtitle"
            to="/lists"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 p-4 pt-0 lg:grid-cols-2">
          <StackedAreaChart
            data={statsCountRequestsByHour.data.map((i) => ({
              timeWindow: i.timeWindow,
              data: [
                {
                  id: "1",
                  count: i.uncachedCount,
                  name: t("uncached"),
                },
                {
                  id: "2",
                  count: i.cachedCount,
                  name: t("cached"),
                },
              ],
            }))}
            title="home.charts.requests.title"
            chartContainerClassName="h-[300px]"
          />
          <StackedAreaChart
            data={statsCountRequestsByKinds.data.map((i) => ({
              timeWindow: i.timeWindow,
              data: i.data.map((j) => ({
                ...j,
                name: indicatorKindMapping[
                  j.id as keyof typeof indicatorKindMapping
                ],
              })),
            }))}
            title="home.charts.requests.by.kinds.title"
            chartContainerClassName="h-[300px]"
          />
          <StackedAreaChart
            data={statsCountRequestsBySources.data}
            title="home.charts.requests.by.sources.title"
            className="lg:col-span-2"
          />
          <StackedAreaChart
            data={statsCountRequestsByProviders.data}
            title="home.charts.requests.by.providers.title"
            className="lg:col-span-2"
          />
        </div>
      </div>
    </>
  );
};

const HistoryComponent: React.FC = () => {
  const requests = useSuspenseQuery(requestsQueryOptions);

  return (
    <>
      <div>
        <h4 className="z-20 mx-4 flex items-center gap-2 font-medium">
          <History size={16} /> <Trans id="home.latest.request.title" />
        </h4>
        {requests.data.length > 0 && (
          <div className="grid grid-cols-1 gap-4 p-4 lg:grid-cols-2 2xl:grid-cols-4">
            {requests.data.slice(0, 4).map((request) => (
              <SearchResults.History key={request.id} data={request} />
            ))}
          </div>
        )}
        {requests.data.length === 0 && (
          <p className="p-4 pb-2 text-sm italic opacity-75">
            <Trans id="no.requests" />
          </p>
        )}
      </div>
      <div className="mx-4">
        <Separator />
      </div>
    </>
  );
};

export const Route = createFileRoute("/")({
  component: IndexComponent,
  beforeLoad: beforeLoadAuthenticated(),
  loader: async ({ context: { queryClient } }) => {
    const user = store.get(userAtom);

    const promises: Promise<unknown>[] = [
      queryClient.ensureQueryData(sourcesQueryOptions),
      queryClient.ensureQueryData(statsCountQueryOptions),
      queryClient.ensureQueryData(statsCountRequestsBySourcesQueryOptions),
      queryClient.ensureQueryData(statsCountRequestsByProvidersQueryOptions),
      queryClient.ensureQueryData(statsCountRequestsByHourQueryOptions),
      queryClient.ensureQueryData(statsCountRequestsByKindsQueryOptions),
    ];

    if (user?.roles.includes("request_view")) {
      promises.push(queryClient.ensureQueryData(requestsQueryOptions));
    }

    await Promise.all(promises);
  },
});

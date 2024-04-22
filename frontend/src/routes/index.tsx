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
import { indicatorKindMapping } from "@/data";
import { configQueryOptions } from "@/api/config";
import {
  RunnerStatus,
  StatsCounter,
  StackedAreaChart,
  SearchResults,
  Forms,
} from "@/components";
import { beforeLoadAuthenticated } from "@/auth";
import { userAtom } from "@/atoms/auth";

const IndexComponent: React.FC = () => {
  const sources = useSuspenseQuery(sourcesQueryOptions);
  const statsCount = useSuspenseQuery(statsCountQueryOptions);
  const requests = useSuspenseQuery(requestsQueryOptions);
  const statsCountRequestsBySources = useSuspenseQuery(
    statsCountRequestsBySourcesQueryOptions
  );
  const statsCountRequestsByProviders = useSuspenseQuery(
    statsCountRequestsByProvidersQueryOptions
  );
  const statsCountRequestsByHour = useSuspenseQuery(
    statsCountRequestsByHourQueryOptions
  );
  const statsCountRequestsByKinds = useSuspenseQuery(
    statsCountRequestsByKindsQueryOptions
  );
  const user = useAtomValue(userAtom);

  const config = useQuery(configQueryOptions);

  const runnersStatus = useRunnersStatus();

  return (
    <>
      <div className="p-4">
        <h3 className="text-xl font-semibold">Welcome {user?.name}!</h3>
        <p>
          Start requesting data from our various sources below or take a sneak
          peak at the various stats of the system
        </p>
      </div>
      <div className="mx-4">
        <Separator />
      </div>
      <h4 className="mx-4 font-medium -mb-4 z-20 flex gap-2 items-center">
        <Send size={16} /> Get data from sources
      </h4>
      <Forms.RequestForm.default sources={sources.data} />
      <div>
        <h4 className="mx-4 font-medium z-20 flex gap-2 items-center">
          <History size={16} /> Latest requests
        </h4>
        <div className="p-4 grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-4 gap-4">
          {requests.data.slice(0, 4).map((request) => (
            <SearchResults.History key={request.id} data={request} />
          ))}
        </div>
      </div>
      <div className="mx-4">
        <Separator />
      </div>
      <div>
        <h4 className="mx-4 font-medium z-20 flex gap-2 items-center">
          <Server size={16} /> Runners status
        </h4>
        <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
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
        <h4 className="mx-4 font-medium z-20 flex gap-2 items-center">
          <AreaChartIcon size={16} /> Stats
        </h4>
        <div className="p-4 grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-4 gap-4">
          <StatsCounter
            Icon={Send}
            count={statsCount.data.history}
            title="Total requests"
            subCount={statsCount.data.historyLast24hrs}
            subTitle="Last 24 hours"
            to="/history"
          />
          <StatsCounter
            Icon={Database}
            count={statsCount.data.sources}
            title="Total sources"
            subCount={statsCount.data.enabledSources}
            subTitle="Enabled sources"
            to="/sources"
          />
          <StatsCounter
            Icon={Globe}
            count={statsCount.data.providers}
            title="Total providers"
            subCount={statsCount.data.enabledProviders}
            subTitle="Enabled providers"
            to="/providers"
          />
          <StatsCounter
            Icon={Scroll}
            count={statsCount.data.ignoreLists}
            title="Total ignore lists"
            subCount={statsCount.data.enabledIgnoreLists}
            subTitle="Enabled ignore lists"
            to="/lists"
          />
        </div>

        <div className="p-4 pt-0 gap-4 grid grid-cols-1 lg:grid-cols-2 ">
          <StackedAreaChart
            data={statsCountRequestsByHour.data.map((i) => ({
              timeWindow: i.timeWindow,
              data: [
                {
                  id: "1",
                  count: i.uncachedCount,
                  name: "Uncached",
                },
                {
                  id: "2",
                  count: i.cachedCount,
                  name: "Cached",
                },
              ],
            }))}
            title="Requests over time (last 24 hours)"
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
            title="Requests by kinds over time (last 24 hours)"
            chartContainerClassName="h-[300px]"
          />
          <StackedAreaChart
            data={statsCountRequestsBySources.data}
            title="Requests by sources over time (last 24 hours)"
            className="lg:col-span-2"
          />
          <StackedAreaChart
            data={statsCountRequestsByProviders.data}
            title="Requests by providers over time (last 24 hours)"
            className="lg:col-span-2"
          />
        </div>
      </div>
    </>
  );
};

export const Route = createFileRoute("/")({
  component: IndexComponent,
  beforeLoad: beforeLoadAuthenticated(),
  loader: async ({ context: { queryClient } }) =>
    await Promise.all([
      queryClient.ensureQueryData(sourcesQueryOptions),
      queryClient.ensureQueryData(statsCountQueryOptions),
      queryClient.ensureQueryData(requestsQueryOptions),
      queryClient.ensureQueryData(statsCountRequestsBySourcesQueryOptions),
      queryClient.ensureQueryData(statsCountRequestsByProvidersQueryOptions),
      queryClient.ensureQueryData(statsCountRequestsByHourQueryOptions),
      queryClient.ensureQueryData(statsCountRequestsByKindsQueryOptions),
    ]),
});

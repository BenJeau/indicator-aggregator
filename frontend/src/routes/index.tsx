import { Link, createFileRoute } from "@tanstack/react-router";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import {
  AreaChart,
  Database,
  Globe,
  History,
  LucideIcon,
  Power,
  Scroll,
  Send,
  Server,
} from "lucide-react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  TooltipProps,
  Bar,
  Legend,
} from "recharts";

import RequestForm from "@/components/request-form";
import { sourcesQueryOptions } from "@/api/sources";
import { Separator } from "@/components/ui/separator";
import {
  statsCountQueryOptions,
  statsCountRequestsByHourQueryOptions,
  statsCountRequestsByProvidersQueryOptions,
  statsCountRequestsBySourcesQueryOptions,
} from "@/api/stats";
import { requestsQueryOptions } from "@/api/requests";
import HistorySearchResult from "@/components/history-search-result";
import { RunnerStatus, useRunnersStatus } from "@/api/runners";
import {
  CountPerHour,
  ServerConfigEntry,
  SourceKind,
} from "@/types/backendTypes";
import {
  runnerStatusBadgeVariantMapping,
  runnerStatusMapping,
  sourceKindIconMapping,
} from "@/data";
import { cn, getConfigValue, getKeyByValue } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { configQueryOptions } from "@/api/config";

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

  const config = useQuery(configQueryOptions);

  const runnersStatus = useRunnersStatus();

  return (
    <>
      <div className="p-4">
        <h3 className="text-xl font-semibold">Welcome John Doe!</h3>
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
      <RequestForm sources={sources.data} />

      <div>
        <h4 className="mx-4 font-medium z-20 flex gap-2 items-center">
          <AreaChart size={16} /> Stats
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
      </div>
      <div className="mx-4">
        <Separator />
      </div>
      <div>
        <h4 className="mx-4 font-medium z-20 flex gap-2 items-center">
          <History size={16} /> Latest requests
        </h4>
        <div className="p-4 grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-4 gap-4">
          {requests.data.slice(0, 4).map((request) => (
            <HistorySearchResult key={request.id} data={request} />
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
          <RunnerStatusViewer
            sourceKind={SourceKind.Python}
            status={runnersStatus.data?.PYTHON}
            address={config.data?.python_runner_grpc_address}
            enabled={config.data?.python_runner_enabled}
          />
          <RunnerStatusViewer
            sourceKind={SourceKind.JavaScript}
            status={runnersStatus.data?.JAVA_SCRIPT}
            address={config.data?.javascript_runner_grpc_address}
            enabled={config.data?.javascript_runner_enabled}
          />
        </div>
      </div>

      <Chart data={statsCountRequestsByHour.data} />
    </>
  );
};

interface RunnerStatusViewerProps {
  sourceKind: SourceKind;
  status?: RunnerStatus;
  address?: ServerConfigEntry<string>;
  enabled?: ServerConfigEntry<boolean>;
}

const RunnerStatusViewer: React.FC<RunnerStatusViewerProps> = ({
  sourceKind,
  status,
  address,
  enabled,
}) => {
  const Icon = sourceKindIconMapping[sourceKind];
  return (
    <Link
      to="/config"
      className="border rounded-xl p-4 shadow-sm flex gap-2 justify-between items-center hover:bg-muted transition-all duration-100 ease-in-out flex-wrap"
      title="View runner configuration..."
    >
      <div className="flex gap-x-4 gap-y-2 items-center flex-wrap">
        <div
          className={cn(
            "rounded-lg w-8 h-8 flex items-center justify-center",
            enabled
              ? getConfigValue(enabled)
                ? "bg-green-500/20"
                : "bg-red-500/20"
              : "bg-muted"
          )}
        >
          <Power size={16} strokeWidth={2.54} />
        </div>
        <div>
          <h3 className="text-xl font-semibold flex gap-2">
            <Icon width={16} className="fill-foreground" />
            {getKeyByValue(SourceKind, sourceKind)} runner
          </h3>
          <p className="text-sm opacity-70 italic">
            {address ? getConfigValue(address) : "-"}
          </p>
        </div>
      </div>
      <Badge
        className="text-xs"
        variant={status ? runnerStatusBadgeVariantMapping[status] : "secondary"}
      >
        {status ? runnerStatusMapping[status] : "Offline"}
      </Badge>
    </Link>
  );
};

function CustomTooltip({
  payload,
  label,
  active,
}: TooltipProps<number, string>) {
  if (active) {
    return (
      <div className="shadow-md rounded-md border bg-popover/50 backdrop-blur-md p-2 text-sm">
        <p>{`${label} : ${payload[0].value}`}</p>
      </div>
    );
  }

  return null;
}

interface ChartProps {
  data: CountPerHour[];
}

const Chart: React.FC<ChartProps> = ({ data }) => (
  <LineChart
    width={600}
    height={300}
    data={data}
    className="border rounded-md shadow-md p-2"
  >
    {/* <Line type="monotone" dataKey="totalCount" stroke="#8884d8" /> */}
    <CartesianGrid stroke="#ccc" />
    <XAxis dataKey="timeWindow" />
    <YAxis />

    <Legend />
    <Bar dataKey="totalCount" stackId="a" fill="#8884d8" />
    <Bar dataKey="cachedCount" stackId="a" fill="#82ca9d" />
    <Tooltip content={CustomTooltip} />
  </LineChart>
);

interface StatsCounterProps {
  Icon: LucideIcon;
  count: number;
  title: string;
  subCount: number;
  subTitle: string;
  to: string;
}

const StatsCounter: React.FC<StatsCounterProps> = ({
  Icon,
  count,
  title,
  subCount,
  subTitle,
  to,
}) => (
  <Link to={to} title="Search results...">
    <div className="rounded-xl border shadow-sm items-center p-4 flex gap-4 hover:bg-muted transition duration-100 ease-in-out cursor-pointer">
      <div className="p-2 rounded-xl bg-primary border">
        <Icon size={32} className="text-white dark:text-black" />
      </div>
      <div>
        <div className="flex items-baseline gap-2 font-semibold -mb-1">
          <h5 className="text-xl">{count}</h5>
          <p className="text-lg">{title}</p>
        </div>
        <div className="flex items-baseline gap-2 opacity-50">
          <h5 className="text-sm">{subCount}</h5>
          <p className="text-sm">{subTitle}</p>
        </div>
      </div>
    </div>
  </Link>
);

export const Route = createFileRoute("/")({
  component: IndexComponent,
  loader: async ({ context: { queryClient } }) =>
    await Promise.all([
      queryClient.ensureQueryData(sourcesQueryOptions),
      queryClient.ensureQueryData(statsCountQueryOptions),
      queryClient.ensureQueryData(requestsQueryOptions),
      queryClient.ensureQueryData(statsCountRequestsBySourcesQueryOptions),
      queryClient.ensureQueryData(statsCountRequestsByProvidersQueryOptions),
      queryClient.ensureQueryData(statsCountRequestsByHourQueryOptions),
    ]),
});

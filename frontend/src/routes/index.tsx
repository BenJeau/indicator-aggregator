import { Link, createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  AreaChart,
  Database,
  Globe,
  History,
  LucideIcon,
  Scroll,
  Send,
} from "lucide-react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  TooltipProps,
} from "recharts";

import RequestForm from "@/components/request-form";
import { sourcesQueryOptions } from "@/api/sources";
import { Separator } from "@/components/ui/separator";
import { statsCountQueryOptions } from "@/api/stats";
import { requestsQueryOptions } from "@/api/requests";
import HistorySearchResult from "@/components/history-search-result";

const IndexComponent: React.FC = () => {
  const sources = useSuspenseQuery(sourcesQueryOptions);
  const statsCount = useSuspenseQuery(statsCountQueryOptions);
  const requests = useSuspenseQuery(requestsQueryOptions);

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
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {requests.data.slice(0, 4).map((request) => (
            <HistorySearchResult key={request.id} data={request} />
          ))}
        </div>
      </div>
      <div className="mx-4">
        <Separator />
      </div>

      <Chart />
    </>
  );
};

const data = [{ name: "Page A", uv: 400, pv: 2400, amt: 2400 }];

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

const Chart = () => (
  <LineChart
    width={600}
    height={300}
    data={data}
    className="border rounded-md shadow-md p-2"
  >
    <Line type="monotone" dataKey="uv" stroke="#8884d8" />
    <CartesianGrid stroke="#ccc" />
    <XAxis dataKey="name" />
    <YAxis />
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
        <Icon size={32} className="text-white" />
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
    ]),
});

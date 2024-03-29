import { Link, createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  AreaChart,
  Database,
  Globe,
  LucideIcon,
  Scroll,
  Send,
} from "lucide-react";

import RequestForm from "@/components/request-form";
import { sourcesQueryOptions } from "@/api/sources";
import { Separator } from "@/components/ui/separator";
import { statsCountQueryOptions } from "@/api/stats";

const IndexComponent: React.FC = () => {
  const sources = useSuspenseQuery(sourcesQueryOptions);
  const statsCount = useSuspenseQuery(statsCountQueryOptions);

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

      <h4 className="mx-4 font-medium -mb-4 z-20 flex gap-2 items-center">
        <AreaChart size={16} /> Stats
      </h4>
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
        <StatsCounter
          Icon={Database}
          title="Total sources"
          count={statsCount.data.sources}
          to="/sources"
        />
        <StatsCounter
          Icon={Globe}
          title="Total providers"
          count={statsCount.data.providers}
          to="/providers"
        />
        <StatsCounter
          Icon={Send}
          title="Total requests"
          count={statsCount.data.history}
          to="/history"
        />
        <StatsCounter
          Icon={Scroll}
          title="Total ignore lists"
          count={statsCount.data.ignoreLists}
          to="/lists"
        />
      </div>
    </>
  );
};

interface StatsCounterProps {
  Icon: LucideIcon;
  title: string;
  count: number;
  to: string;
}

const StatsCounter: React.FC<StatsCounterProps> = ({
  Icon,
  title,
  count,
  to,
}) => (
  <Link to={to}>
    <div className="rounded-md border shadow items-center p-4 flex gap-4 hover:bg-muted transition duration-100 ease-in-out cursor-pointer">
      <Icon size={32} strokeWidth={1.5} className="text-primary" />
      <div>
        <h5 className="text-lg font-semibold">{count}</h5>
        <p>{title}</p>
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
    ]),
});

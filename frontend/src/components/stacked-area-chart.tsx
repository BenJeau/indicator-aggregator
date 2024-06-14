import dayjs from "dayjs";
import { Eye, EyeOff } from "lucide-react";
import { useMemo, useState } from "react";
import {
  TooltipProps,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Label,
  Legend,
  Area,
  Tooltip,
  AreaChart,
} from "recharts";
import { Payload } from "recharts/types/component/DefaultLegendContent";
import {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CountPerIdWrapper } from "@/types/backendTypes";
import { TransId, useTranslation } from "@/i18n";
import { Trans } from "@/components";

function DynamicCustomTooltip({
  payload,
  active,
  hiddenAreas,
}: TooltipProps<ValueType, NameType> & { hiddenAreas: Set<string> }) {
  if (active) {
    if (!payload?.[0]) return null;

    const data = payload[0].payload as {
      original: CountPerIdWrapper;
      data: Record<string, { count: number; name: string }>;
    };

    return (
      <div className="rounded-md border bg-popover/50 shadow-md backdrop-blur-md">
        <p className="rounded-t-md border-b bg-background p-2 text-base font-semibold">
          {dayjs(data.original.timeWindow).format("ll - H[h]")}
        </p>
        <div className="p-2 text-sm font-normal">
          {Object.entries(data.data)
            .map(([key, { count, name }], index) => [
              key,
              { count, name, index },
            ])
            .filter((i) => !hiddenAreas.has(`data.${i[0]}.count`))
            // @ts-expect-error - TS doesn't like the filter above
            .map(([key, { count, name, index }]) => (
              <div
                className="flex justify-between gap-4"
                key={key as string}
                style={{ color: areaColors[index % areaColors.length] }}
              >
                <p>{name}</p>
                <p className="font-semibold">{count}</p>
              </div>
            ))}
        </div>
      </div>
    );
  }

  return null;
}

interface ChartDynamicProps {
  data: CountPerIdWrapper[];
  title: TransId;
  className?: string;
  chartContainerClassName?: string;
  emptyDataLabel?: TransId;
}

const rainbowColors = [
  "#ea580c",
  "#d97706",
  "#ca8a04",
  "#65a30d",
  "#16a34a",
  "#059669",
  "#0d9488",
  "#0891b2",
  "#0284c7",
  "#2563eb",
  "#4f46e5",
  "#7c3aed",
  "#9333ea",
  "#c026d3",
  "#db2777",
  "#e11d48",
  "#dc2626",
];

const numSeparations = 3;
const areaColors = Array.from({ length: numSeparations }, (_, i) =>
  rainbowColors.filter((_, j) => j % numSeparations === i),
)
  .flat()
  .reverse();

const StackedAreaChart: React.FC<ChartDynamicProps> = ({
  data,
  title,
  className,
  chartContainerClassName,
  emptyDataLabel,
}) => {
  const { t } = useTranslation();
  const areas = useMemo(() => {
    return data.reduce((acc, curr) => {
      const ids = curr.data.reduce(
        (acc, i) => ({
          ...acc,
          [i.id ?? "null"]: i.name ?? t(emptyDataLabel ?? "no.results"),
        }),
        {},
      );
      return {
        ...acc,
        ...ids,
      };
    }, {});
  }, [data, emptyDataLabel, t]);

  const chartData = data.map((i) => ({
    original: i,
    data: Object.entries(areas).reduce((acc, [id, name]) => {
      const found = i.data.find(
        (j) => j.id === id || (j.id === null && id === "null"),
      );
      return {
        ...acc,
        [id]: { count: found ? found.count : 0, name },
      };
    }, {}),
    time: dayjs(i.timeWindow).format("H[h]"),
  }));

  const [hideAreas, setHideAreas] = useState(new Set<string>());
  const [hoveredAread, setHoveredArea] = useState<string | undefined>(
    undefined,
  );

  const selectLegend = (e: Payload) => {
    setHideAreas((prev) => {
      const key = e.dataKey?.toString();

      if (key) {
        if (prev.has(key)) {
          prev.delete(key);
        } else {
          prev.add(key);
        }
      }

      return new Set(prev);
    });
  };

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-4 rounded-xl border p-4 text-sm shadow-sm",
        className,
      )}
    >
      <div className="flex justify-between gap-2">
        <h3 className="text-lg font-bold">
          <Trans id={title} />
        </h3>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              setHideAreas(new Set());
            }}
            className="gap-2"
            size="sm"
            variant="secondary"
            disabled={hideAreas.size === 0}
          >
            <Eye size={16} />
            <Trans id="show.all" />
          </Button>
          <Button
            onClick={() => {
              setHideAreas(
                new Set(Object.keys(areas).map((i) => `data.${i}.count`)),
              );
            }}
            className="gap-2"
            size="sm"
            variant="secondary"
            disabled={hideAreas.size === Object.keys(areas).length}
          >
            <EyeOff size={16} />
            <Trans id="hide.all" />
          </Button>
        </div>
      </div>
      <div className={cn("h-[500px]", chartContainerClassName)}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" tickMargin={5} />
            <YAxis
              allowDecimals={false}
              tickMargin={5}
              className="fill-black dark:fill-white"
            >
              <Label
                angle={270}
                dx={-10}
                className="fill-black dark:fill-white"
              >
                <Trans id="number.of.requests" />
              </Label>
            </YAxis>
            <Legend
              className="cursor-pointer font-bold"
              onClick={selectLegend}
              onMouseEnter={(e) => {
                setHoveredArea(e.dataKey?.toString());
              }}
              onMouseLeave={() => {
                setHoveredArea(undefined);
              }}
            />
            {Object.entries(areas).map(([id, name], index) => {
              const dataKey = `data.${id}.count`;
              const opacity =
                hoveredAread === undefined
                  ? 0.5
                  : dataKey === hoveredAread
                    ? 1
                    : 0.2;
              return (
                <Area
                  key={id}
                  type="monotone"
                  dataKey={dataKey}
                  name={name as string}
                  stackId="1"
                  stroke={areaColors[index % areaColors.length]}
                  fill={areaColors[index % areaColors.length]}
                  hide={hideAreas.has(dataKey)}
                  fillOpacity={opacity}
                  strokeOpacity={opacity}
                />
              );
            })}
            <Tooltip
              content={(props) => (
                <DynamicCustomTooltip {...props} hiddenAreas={hideAreas} />
              )}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StackedAreaChart;

import { useMemo } from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ReqestSSEData } from "@/api/requests";
import { AutoAnimate, Empty, TitleEntryCount } from "@/components";
import { Source } from "@/components/sources";
import WaitingImage from "@/assets/day-dreaming-two-color.svg";
import LoadingImage from "@/assets/waiter-two-color.svg";
import { Badge } from "@/components/ui/badge";
import { LoaderCircle } from "lucide-react";

interface Props {
  data?: { [key: string]: ReqestSSEData };
  isFetching?: boolean;
}

const RequestDataView: React.FC<Props> = ({ isFetching, data }) => {
  const [sourceWithoutErrors, sourceWithErrors, missingSourceCode] =
    useMemo(() => {
      const allSources = Object.values(data ?? {});

      const missingSourceCode = allSources.filter(
        (data) => !data.hasSourceCode
      );
      const withSourceCode = allSources.filter((data) => data.hasSourceCode);

      const sourceWithErrors = withSourceCode.filter(
        (data) => data.errors.length > 0
      );
      const sourceWithoutErrors = withSourceCode.filter(
        (data) => data.errors.length === 0
      );

      const sortSoures = (a: ReqestSSEData, b: ReqestSSEData) =>
        a.source.name.localeCompare(b.source.name);

      return [
        sourceWithoutErrors.sort((a, b) => {
          const aDataLength =
            a.data == undefined ? 0 : Array.isArray(a.data) ? a.data.length : 1;
          const bDataLength =
            b.data == undefined ? 0 : Array.isArray(b.data) ? b.data.length : 1;

          if (aDataLength > bDataLength) {
            return -1;
          }

          if (aDataLength < bDataLength) {
            return 1;
          }

          return sortSoures(a, b);
        }),
        sourceWithErrors.sort(sortSoures),
        missingSourceCode.sort(sortSoures),
      ];
    }, [data]);

  const sourcesOrdered = [
    ...sourceWithoutErrors,
    ...sourceWithErrors,
    ...missingSourceCode,
  ];

  const disabledIndicator = sourceWithErrors.filter((data) =>
    data.errors.some((error) => error.kind === "DISABLED_INDICATOR")
  );
  const disabledSource = sourceWithErrors.filter((data) =>
    data.errors.some((error) => error.kind === "SOURCE_DISABLED")
  );
  const disabledProvider = sourceWithErrors.filter((data) =>
    data.errors.some((error) => error.kind === "PROVIDER_DISABLED")
  );
  const unsupportedIndicator = sourceWithErrors.filter((data) =>
    data.errors.some((error) => error.kind === "UNSUPPORTED_INDICATOR")
  );
  const whitelistedIndicator = sourceWithErrors.filter((data) =>
    data.errors.some((error) => error.kind === "WITHIN_IGNORE_LIST")
  );
  const missingSecrets = sourceWithErrors.filter((data) =>
    data.errors.some((error) => error.kind === "MISSING_SECRET")
  );

  return (
    <div className="m-4 flex flex-1 flex-col gap-2">
      <div className="mb-2 flex items-center justify-between">
        {sourcesOrdered.length !== 0 && (
          <div className="flex flex-wrap items-baseline gap-2 gap-y-0 text-lg font-semibold">
            <span className="whitespace-nowrap">Source data</span>
            <TitleEntryCount count={sourcesOrdered.length} />
            {isFetching && (
              <div className="mt-1 self-center">
                <LoaderCircle size={16} className="animate-spin" />
              </div>
            )}
          </div>
        )}
        <div className="flex flex-wrap justify-end gap-2 gap-y-1">
          <BadgeTooltip title="Missing source code" data={missingSourceCode} />
          <BadgeTooltip title="Disabled sources" data={disabledSource} />
          <BadgeTooltip title="Disabled indicators" data={disabledIndicator} />
          <BadgeTooltip
            title="Unsupported indicators"
            data={unsupportedIndicator}
          />
          <BadgeTooltip title="Missing secrets" data={missingSecrets} />
          <BadgeTooltip title="Disabled providers" data={disabledProvider} />
          <BadgeTooltip title="Whitelisted" data={whitelistedIndicator} />
        </div>
      </div>
      {sourcesOrdered.length === 0 && !isFetching && (
        <Empty
          image={WaitingImage}
          title="Make a request"
          description="Start by making a request to see the data we have"
          className="flex-1"
        />
      )}
      {sourcesOrdered.length === 0 && isFetching && (
        <Empty
          image={LoadingImage}
          title="Requesting data"
          description="We are fetching the data for you"
          className="flex-1"
        />
      )}
      <AutoAnimate className="grid grid-cols-12 gap-2">
        {sourceWithoutErrors.map((source) => (
          <Source key={source.source.id} {...source} />
        ))}
      </AutoAnimate>
      <AutoAnimate className="my-4 grid grid-cols-12 gap-2">
        {sourceWithErrors.map((source) => (
          <Source key={source.source.id} {...source} />
        ))}
      </AutoAnimate>
      <AutoAnimate className="grid grid-cols-12 gap-2">
        {missingSourceCode.map((source) => (
          <Source key={source.source.id} {...source} />
        ))}
      </AutoAnimate>
    </div>
  );
};

const BadgeTooltip: React.FC<{ title: string; data: ReqestSSEData[] }> = ({
  title,
  data,
}) =>
  data.length > 0 && (
    <Tooltip>
      <TooltipTrigger>
        <Badge variant="secondary">
          {title} {data.length}
        </Badge>
      </TooltipTrigger>
      <TooltipContent side="bottom" align="end">
        <ul className="list-disc ps-2">
          {data.map(({ source }) => (
            <li key={source.id}>{source.name}</li>
          ))}
        </ul>
      </TooltipContent>
    </Tooltip>
  );

export default RequestDataView;

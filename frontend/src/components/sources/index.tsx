import dayjs from "dayjs";
import { Database, Download, Hourglass, Save, ServerCrash } from "lucide-react";
import { useState } from "react";
import { Link } from "@tanstack/react-router";

import { SourceError } from "@/types/backendTypes";
import FullBadge from "@/components/full-badge";
import TitleEntryCount from "@/components/title-entry-count";
import config from "@/config";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ReqestSSEData } from "@/api/requests";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Editor } from "@/components";

import { PhishTank } from "./phishtank";

export interface SourceProps<T> {
  data?: T;
}

const InnerSource = {
  PhishTank: {
    Component: PhishTank,
  },
};

export const Source: React.FC<ReqestSSEData> = ({
  source,
  data,
  timing,
  cache,
  errors,
  hasSourceCode,
}) => {
  const entryCount =
    data == undefined ? 0 : Array.isArray(data) ? data.length : 1;
  const Content =
    source.name in InnerSource
      ? InnerSource[source.name as keyof typeof InnerSource].Component
      : () => <Editor language="json" value={JSON.stringify(data, null, 2)} />;
  const diff = dayjs(timing?.endedAt).diff(dayjs(timing?.startedAt));

  const [imgHasError, setImgHasError] = useState(true);

  const shouldHaveData = errors.length === 0 && hasSourceCode;

  return (
    <div
      className={cn(
        "col-span-12 flex flex-col gap-2 2xl:col-span-6",
        !shouldHaveData &&
          "border-destructive justify-center rounded-md border bg-red-500/20 px-2 py-1 md:col-span-6 2xl:col-span-4",
        !hasSourceCode && "opacity-50 grayscale"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center gap-4">
          <a href={source.url} target="_blank" rel="noopener noreferrer">
            <img
              src={
                source.favicon ??
                `${config.rest_server_base_url}/favicon?url=${source.url}`
              }
              style={{ imageRendering: "pixelated" }}
              className={cn(
                "min-h-4 w-4 min-w-4 rounded border shadow",
                imgHasError && "hidden"
              )}
              onError={() => setImgHasError(true)}
              onLoad={() => setImgHasError(false)}
            />
            <Database size={16} className={cn(!imgHasError && "hidden")} />
          </a>
          <div className="flex flex-wrap items-baseline gap-2 gap-y-0 font-medium">
            <Link to="/sources/$slug" params={{ slug: source.slug }}>
              {source.name}
            </Link>
            {shouldHaveData && <TitleEntryCount count={entryCount} />}
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2 gap-y-1">
          {errors.length !== 0 && (
            <span className="flex flex-col items-end text-xs italic">
              {errors.map((error, i) => (
                <span key={i}>{SourceErrorPreview[error.kind]} </span>
              ))}
            </span>
          )}
          {!hasSourceCode && (
            <span className="text-xs italic">Missing source code</span>
          )}
          {shouldHaveData && (
            <>
              {cache?.action && (
                <Tooltip>
                  <TooltipTrigger>
                    <Badge className="gap-2 mt-1" variant="outline">
                      {cache?.action === "FROM_CACHE" ? (
                        <ServerCrash size={16} />
                      ) : (
                        <Save size={16} />
                      )}
                      {cache?.action === "FROM_CACHE"
                        ? "Response cached"
                        : "Cached response"}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" align="end">
                    <div className="flex justify-between gap-2">
                      <span className="font-semibold">Expires at</span>
                      <span>
                        {dayjs(cache?.expiresAt).format("DD-MM-YYYY HH:mm:ss")}
                      </span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="font-semibold">Cached at</span>
                      {dayjs(cache?.cachedAt).format("DD-MM-YYYY HH:mm:ss")}
                    </div>

                    <div className="flex justify-between gap-2">
                      <span className="font-semibold">Cache key</span>
                      {cache?.cacheKey}
                    </div>
                  </TooltipContent>
                </Tooltip>
              )}
              {entryCount > 0 && (
                <Button
                  variant="secondary"
                  className="h-6"
                  size="sm"
                  onClick={() => {
                    const blob = new Blob([JSON.stringify(data, null, 2)], {
                      type: "application/json",
                    });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `${source.name}_response_${dayjs(timing?.startedAt).format("DD-MM-YYYY_HHmm")}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  <Download size={12} />
                </Button>
              )}
              <Tooltip>
                <TooltipTrigger>
                  <FullBadge
                    Icon={Hourglass}
                    label="Elapsed"
                    valueBadgeProps={{
                      variant: diff > 500 ? "destructive" : "success",
                    }}
                    value={getElapsedTime(diff)}
                  />
                </TooltipTrigger>
                <TooltipContent side="bottom" align="end">
                  <div className="flex justify-between gap-2">
                    <span className="font-semibold">Started at</span>
                    <span>
                      {dayjs(timing?.startedAt).format("DD-MM-YYYY HH:mm:ss")}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="font-semibold">Ended at</span>
                    <span>
                      {dayjs(timing?.endedAt).format("DD-MM-YYYY HH:mm:ss")}
                    </span>
                  </div>
                </TooltipContent>
              </Tooltip>
            </>
          )}
        </div>
      </div>
      {/* @ts-expect-error Lazy */}
      {shouldHaveData && entryCount > 0 && <Content data={data} />}
      {shouldHaveData && entryCount === 0 && (
        <span className="text-xs italic opacity-50">no data</span>
      )}
    </div>
  );
};

function getElapsedTime(diff: number): string {
  if (diff < 1000) {
    return `${diff}ms`;
  }

  diff = Math.floor(diff / 1000);

  if (diff < 60) {
    return `${diff}s`;
  }

  diff = Math.floor(diff / 60);
  return `${diff}m`;
}

const SourceErrorPreview: { [key in SourceError["kind"]]: string } = {
  DISABLED_INDICATOR: "Disabled Indicator",
  PROVIDER_DISABLED: "Disabled Provider",
  RUNNER_DISABLED: "Disabled Runner",
  MISSING_SECRET: "Missing Secret",
  SOURCE_DISABLED: "Source Disabled",
  UNSUPPORTED_INDICATOR: "Unsupported Indicator",
  WITHIN_IGNORE_LIST: "Within Ignore List",
  TIMEOUT: "Timeout",
  NOT_FOUND: "Not Found",
  UNAUTHORIZED: "Unauthorized",
  REQUEST_ERROR: "Request Error",
  RESPONSE_ERROR: "Response Error",
  DATABASE_ERROR: "Database Error",
  INTERNAL_SERVER_ERROR: "Internal Server Error",
  MISSING_SOURCE_CODE: "Missing Source Code",
  RATE_LIMITED: "Rate Limited",
};

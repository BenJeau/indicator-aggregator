import dayjs from "dayjs";
import { Database, Download, Hourglass, Save, ServerCrash } from "lucide-react";
import { useState } from "react";
import { Link } from "@tanstack/react-router";

import { SourceError } from "@/types/backendTypes";
import FullBadge from "@/components/full-badge";
import TitleEntryCount from "@/components/title-entry-count";
import config from "@/lib/config";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ReqestSSEData } from "@/api/requests";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Editor, Trans } from "@/components";
import { TransId, useTranslation } from "@/i18n";

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
  const entryCount = !data ? 0 : Array.isArray(data) ? data.length : 1;
  const Content =
    source.name in InnerSource
      ? InnerSource[source.name as keyof typeof InnerSource].Component
      : () => <Editor language="json" value={JSON.stringify(data, null, 2)} />;
  const diff = dayjs(timing?.endedAt).diff(dayjs(timing?.startedAt));

  const [imgHasError, setImgHasError] = useState(true);
  const { t } = useTranslation();

  const shouldHaveData = errors.length === 0 && hasSourceCode;

  return (
    <div
      className={cn(
        "col-span-12 flex flex-col gap-2 2xl:col-span-6",
        !shouldHaveData &&
          "justify-center rounded-md border border-destructive bg-red-500/20 px-2 py-1 md:col-span-6 2xl:col-span-4",
        !hasSourceCode && "opacity-50 grayscale",
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center gap-4">
          <a href={source.url} target="_blank" rel="noopener noreferrer">
            <img
              alt={t("source.favicon.alt")}
              src={
                source.favicon ??
                `${config.rest_server_base_url}/favicon?url=${source.url}`
              }
              style={{ imageRendering: "pixelated" }}
              className={cn(
                "min-h-4 w-4 min-w-4 rounded border shadow",
                imgHasError && "hidden",
              )}
              onError={() => {
                setImgHasError(true);
              }}
              onLoad={() => {
                setImgHasError(false);
              }}
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
              {errors.map((error) => (
                <span key={error.kind}>
                  <Trans id={SourceErrorPreview[error.kind]} />
                </span>
              ))}
            </span>
          )}
          {!hasSourceCode && (
            <span className="text-xs italic">
              <Trans id="missing.source.code" />
            </span>
          )}
          {shouldHaveData && (
            <>
              {cache?.action && (
                <Tooltip>
                  <TooltipTrigger>
                    <Badge className="mt-1 gap-2" variant="outline">
                      {cache.action === "FROM_CACHE" ? (
                        <ServerCrash size={16} />
                      ) : (
                        <Save size={16} />
                      )}
                      <Trans
                        id={
                          cache.action === "FROM_CACHE"
                            ? "response.cached"
                            : "cached.response"
                        }
                      />
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" align="end">
                    <div className="flex justify-between gap-2">
                      <span className="font-semibold">
                        <Trans id="expires.at" />
                      </span>
                      <span>
                        {dayjs(cache.expiresAt).format("DD-MM-YYYY HH:mm:ss")}
                      </span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="font-semibold">
                        <Trans id="cached.at" />
                      </span>
                      {dayjs(cache.cachedAt).format("DD-MM-YYYY HH:mm:ss")}
                    </div>

                    <div className="flex justify-between gap-2">
                      <span className="font-semibold">
                        <Trans id="cache.key" />
                      </span>
                      {cache.cacheKey}
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
                    label="elapsed"
                    valueBadgeProps={{
                      variant: diff > 1000 ? "destructive" : "success",
                    }}
                    value={getElapsedTime(diff)}
                  />
                </TooltipTrigger>
                <TooltipContent side="bottom" align="end">
                  <div className="flex justify-between gap-2">
                    <span className="font-semibold">
                      <Trans id="started.at" />
                    </span>
                    <span>
                      {dayjs(timing?.startedAt).format("DD-MM-YYYY HH:mm:ss")}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="font-semibold">
                      <Trans id="ended.at" />
                    </span>
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
        <span className="text-xs lowercase italic opacity-50">
          <Trans id="no.data" />
        </span>
      )}
    </div>
  );
};

function getElapsedTime(diff: number): string {
  if (diff < 1000) {
    return `${diff.toString()}ms`;
  }

  diff = Math.floor(diff / 1000);

  if (diff < 60) {
    return `${diff.toString()}s`;
  }

  diff = Math.floor(diff / 60);
  return `${diff.toString()}m`;
}

const SourceErrorPreview: { [key in SourceError["kind"]]: TransId } = {
  DISABLED_INDICATOR: "disabled.indicator",
  PROVIDER_DISABLED: "disabled.provider",
  RUNNER_DISABLED: "disabled.runner",
  MISSING_SECRET: "missing.secret",
  SOURCE_DISABLED: "disabled.source",
  UNSUPPORTED_INDICATOR: "unsupported.indicator",
  WITHIN_IGNORE_LIST: "within.ignore.list",
  TIMEOUT: "timeout",
  NOT_FOUND: "not.found",
  UNAUTHORIZED: "unauthorized",
  REQUEST_ERROR: "request.error",
  RESPONSE_ERROR: "response.error",
  DATABASE_ERROR: "database.error",
  INTERNAL_SERVER_ERROR: "internal.server.error",
  MISSING_SOURCE_CODE: "missing.source.code",
  RATE_LIMITED: "rate.limited",
};

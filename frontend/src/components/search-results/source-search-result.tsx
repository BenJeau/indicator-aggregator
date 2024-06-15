import { Database, Power } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { Source } from "@/types/backendTypes";
import { Badge } from "@/components/ui/badge";
import { ComponentSearchResultProps } from "@/components/generic-panel-search";
import config from "@/lib/config";
import { sourceKindIconMapping } from "@/lib/data";
import { Trans } from "@/components";
import { useTranslation } from "@/i18n";

const SourceSearchResult: React.FC<ComponentSearchResultProps<Source>> = ({
  data: { slug, name, description, enabled, providerId, url, favicon, kind },
}) => {
  const [imgHasError, setImgHasError] = useState(true);
  const { t } = useTranslation();

  const SourceKindIcon = sourceKindIconMapping[kind];

  return (
    <Link
      to="/sources/$slug"
      params={{ slug }}
      activeProps={{
        className: "bg-primary/10 border-primary shadow-primary/40",
      }}
      className="flex flex-col gap-2 rounded-xl border p-4 shadow-sm transition duration-100 ease-in-out hover:bg-muted"
    >
      <div className="flex flex-col justify-between gap-2 lg:flex-row">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <img
              src={
                favicon ?? `${config.rest_server_base_url}/favicon?url=${url}`
              }
              alt={t("source.favicon.alt")}
              style={{ imageRendering: "pixelated" }}
              className={cn(
                "hidden h-8 w-8 rounded border shadow",
                !imgHasError && "xl:block",
              )}
              onError={() => {
                setImgHasError(true);
              }}
              onLoad={() => {
                setImgHasError(false);
              }}
            />
            <Database
              size={32}
              className={cn("hidden min-w-4", imgHasError && "xl:block")}
            />
            <div className="flex flex-col gap-2 gap-y-1 lg:gap-y-0">
              <div className="flex items-center gap-1 font-semibold">
                <SourceKindIcon className="h-4 min-w-4 dark:fill-white" />
                {name}
              </div>
              <div className="whitespace-nowrap text-xs lowercase opacity-70">
                <Trans id={providerId ? "has.provider" : "has.no.provider"} />
              </div>
            </div>
          </div>

          <div className="text-sm">
            {description}
            {description.length === 0 && (
              <div className="lowercase italic opacity-50">
                <Trans id="no.description" />
              </div>
            )}
          </div>
        </div>
        <div className="flex items-baseline">
          <Badge
            className={cn(
              "p-1",
              enabled
                ? "bg-green-500/20 hover:bg-green-500/20"
                : "bg-red-500/20 hover:bg-red-500/20",
            )}
            variant="secondary"
          >
            <Power size={12} strokeWidth={3} />
          </Badge>
        </div>
      </div>
    </Link>
  );
};

export default SourceSearchResult;

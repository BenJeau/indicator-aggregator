import { Database, Power } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { Source } from "@/types/backendTypes";
import { Badge } from "@/components/ui/badge";
import { ComponentSearchResultProps } from "@/components/generic-panel-search";
import config from "@/config";
import { sourceKindIconMapping } from "@/data";

const SourceSearchResult: React.FC<ComponentSearchResultProps<Source>> = ({
  data: { slug, name, description, enabled, providerId, url, favicon, kind },
}) => {
  const [imgHasError, setImgHasError] = useState(true);

  const SourceKindIcon = sourceKindIconMapping[kind];

  return (
    <Link
      to="/sources/$slug"
      params={{ slug }}
      activeProps={{
        className: "bg-primary/10 border-primary shadow-primary/40",
      }}
      className="border rounded-xl p-4 shadow-sm flex gap-2 flex-col hover:bg-muted transition duration-100 ease-in-out"
    >
      <div className="flex justify-between gap-2 flex-col lg:flex-row">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <img
              src={
                favicon ?? `${config.rest_server_base_url}/favicon?url=${url}`
              }
              style={{ imageRendering: "pixelated" }}
              className={cn(
                "w-8 h-8 rounded shadow border hidden",
                !imgHasError && "xl:block"
              )}
              onError={() => setImgHasError(true)}
              onLoad={() => setImgHasError(false)}
            />
            <Database
              size={32}
              className={cn("min-w-4 hidden", imgHasError && "xl:block")}
            />
            <div className="flex gap-2 flex-col gap-y-1 lg:gap-y-0">
              <div className="font-semibold flex items-center gap-1">
                <SourceKindIcon className="min-w-4 h-4 dark:fill-white" />
                {name}
              </div>
              <div className="text-xs opacity-70 whitespace-nowrap">
                {providerId && "has provider"}
                {!providerId && "has no provider"}
              </div>
            </div>
          </div>

          <div className="text-sm">
            {description}
            {description.length === 0 && (
              <div className="opacity-50 italic">no description</div>
            )}
          </div>
        </div>
        <div className="flex items-baseline">
          <Badge
            className={cn(
              "p-1",
              enabled
                ? "bg-green-500/20 hover:bg-green-500/20"
                : "bg-red-500/20 hover:bg-red-500/20"
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

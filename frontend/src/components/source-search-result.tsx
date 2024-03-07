import { Database, Power } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { Source } from "@/types/backendTypes";
import { Badge } from "@/components/ui/badge";
import { ComponentSearchResultProps } from "@/components/generic-panel-search";
import config from "@/config";

const SourceSearchResult: React.FC<ComponentSearchResultProps<Source>> = ({
  data: { id, name, description, enabled, providerId, url, favicon },
}) => {
  const [imgHasError, setImgHasError] = useState(true);

  return (
    <Link
      to="/sources/$id"
      params={{ id }}
      activeProps={{
        className: "bg-primary/10 border-primary shadow-primary/40",
      }}
      className="border rounded-xl p-4 shadow-sm flex gap-2 flex-col hover:bg-muted transition duration-100 ease-in-out"
    >
      <div className="flex justify-between gap-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <img
              src={
                favicon ?? `${config.rest_server_base_url}/favicon?url=${url}`
              }
              style={{ imageRendering: "pixelated" }}
              className={cn(
                "w-6 h-6 rounded shadow border",
                imgHasError && "hidden"
              )}
              onError={() => setImgHasError(true)}
              onLoad={() => setImgHasError(false)}
            />
            <Database
              size={16}
              className={cn("min-w-4", !imgHasError && "hidden")}
            />
            <div className="flex gap-2 items-baseline flex-wrap gap-y-0">
              <div className="font-semibold">{name}</div>
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
        <div className="flex flex-col">
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

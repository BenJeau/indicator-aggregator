import { Globe, Power } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { Provider } from "@/types/backendTypes";
import { Badge } from "@/components/ui/badge";
import { ComponentSearchResultProps } from "@/components/generic-panel-search";
import config from "@/lib/config";
import { Trans } from "@/components";

const ProviderSearchResult: React.FC<ComponentSearchResultProps<Provider>> = ({
  data: { slug, name, description, enabled, numSources, url, favicon },
}) => {
  const [imgHasError, setImgHasError] = useState(false);

  return (
    <Link
      to="/providers/$slug"
      params={{ slug }}
      activeProps={{
        className: "bg-primary/10 border-primary shadow-primary/40",
      }}
      className="flex flex-col gap-2 rounded-xl border p-4 shadow-sm transition duration-100 ease-in-out hover:bg-muted"
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
                "h-6 w-6 rounded border shadow",
                imgHasError && "hidden",
              )}
              onError={() => setImgHasError(true)}
              onLoad={() => setImgHasError(false)}
            />
            <Globe
              size={16}
              className={cn("min-w-4", !imgHasError && "hidden")}
            />
            <div className="flex flex-wrap items-baseline gap-2 gap-y-0">
              <div className="font-semibold">{name}</div>
              <div className="whitespace-nowrap text-xs lowercase opacity-70">
                {numSources} <Trans id="source" />
                {numSources > 1 && "s"}
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
        <div className="flex flex-col">
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

export default ProviderSearchResult;

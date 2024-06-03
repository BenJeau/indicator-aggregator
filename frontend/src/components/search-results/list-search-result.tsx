import { Power } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { cn } from "@/lib/utils";
import { IgnoreList } from "@/types/backendTypes";
import { Badge } from "@/components/ui/badge";
import { ComponentSearchResultProps } from "@/components/generic-panel-search";
import { Trans } from "@/components";

const ListSearchResult: React.FC<ComponentSearchResultProps<IgnoreList>> = ({
  data: { slug, name, description, enabled, global },
}) => (
  <Link
    to="/lists/$slug"
    params={{ slug }}
    activeProps={{
      className: "bg-primary/10 border-primary shadow-primary/40",
    }}
    className="flex flex-col gap-2 rounded-xl border p-4 shadow-sm transition duration-100 ease-in-out hover:bg-muted"
  >
    <div className="flex justify-between">
      <div className="flex flex-col gap-2">
        <div className="flex items-baseline gap-2">
          <div className="font-semibold">{name}</div>
          <div className="text-xs lowercase opacity-70">
            <Trans id={global ? "is.global" : "is.not.global"} />
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

export default ListSearchResult;

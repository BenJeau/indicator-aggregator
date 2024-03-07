import { Power } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { cn } from "@/lib/utils";
import { IgnoreList } from "@/types/backendTypes";
import { Badge } from "@/components/ui/badge";
import { ComponentSearchResultProps } from "./generic-panel-search";

const ListSearchResult: React.FC<ComponentSearchResultProps<IgnoreList>> = ({
  data: { id, name, description, enabled, global },
}) => (
  <Link
    to="/lists/$id"
    params={{ id }}
    activeProps={{
      className: "bg-primary/10 border-primary shadow-primary/40",
    }}
    className="border rounded-xl p-4 shadow-sm flex gap-2 flex-col hover:bg-muted transition duration-100 ease-in-out"
  >
    <div className="flex justify-between">
      <div className="flex flex-col gap-2">
        <div className="flex gap-2 items-baseline">
          <div className="font-semibold">{name}</div>
          <div className="text-xs opacity-70">
            {global && "is global"}
            {!global && "is not global"}
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

export default ListSearchResult;

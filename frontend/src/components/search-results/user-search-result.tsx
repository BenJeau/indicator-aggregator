import { Power } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { cn } from "@/lib/utils";
import { UserWithNumLogs } from "@/types/backendTypes";
import { Badge } from "@/components/ui/badge";
import { ComponentSearchResultProps } from "@/components/generic-panel-search";
import { Trans } from "@/components";

const UserSearchResult: React.FC<
  ComponentSearchResultProps<UserWithNumLogs>
> = ({
  data: {
    user: { id, name, enabled, email },
    numLogs,
  },
}) => (
  <Link
    to="/users/$id"
    params={{ id }}
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
            {numLogs} <Trans id={numLogs > 1 ? "logs" : "log"} />
          </div>
        </div>
        <div className="text-sm">{email}</div>
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

export default UserSearchResult;

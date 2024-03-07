import { Link } from "@tanstack/react-router";
import dayjs from "dayjs";

import { Request } from "@/types/backendTypes";
import { ComponentSearchResultProps } from "@/components/generic-panel-search";
import { Badge } from "@/components/ui/badge";

const HistorySearchResult: React.FC<ComponentSearchResultProps<Request>> = ({
  data: { id, data, kind, createdAt },
}) => (
  <Link
    to="/history/$id"
    params={{ id }}
    activeProps={{
      className: "bg-primary/10 border-primary shadow-primary/40 p-4",
    }}
    className="border rounded-xl p-2 shadow-sm flex gap-2 flex-col hover:bg-muted transition-all duration-100 ease-in-out"
  >
    <div className="flex flex-col">
      <div className="flex justify-between gap-2">
        <div className="font-semibold">{data}</div>
        <Badge variant="secondary">{kind}</Badge>
      </div>
      <div className="text-xs">{dayjs(createdAt).format("lll")}</div>
    </div>
  </Link>
);

export default HistorySearchResult;

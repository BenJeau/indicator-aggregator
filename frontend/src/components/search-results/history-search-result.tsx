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
      className: "bg-primary/10 border-primary shadow-primary/40",
    }}
    className="flex flex-col gap-2 rounded-xl border p-4 shadow-sm transition-all duration-100 ease-in-out hover:bg-muted"
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

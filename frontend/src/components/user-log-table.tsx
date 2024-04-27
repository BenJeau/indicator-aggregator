import dayjs from "dayjs";

import { DataTable } from "@/components";
import { DbUserLog } from "@/types/backendTypes";

interface Props {
  data: DbUserLog[];
}

const UserLogTable: React.FC<Props> = ({ data }) => (
  <DataTable
    columns={[
      {
        header: "ID",
        accessorKey: "id",
        size: 60,
      },
      {
        header: "Time",
        accessorKey: "createdAt",
        accessorFn: ({ createdAt }) => dayjs(createdAt).format("L LT"),
        size: 100,
      },
      {
        header: "Method",
        accessorKey: "method",
        size: 50,
      },
      {
        header: "URI",
        accessorKey: "uri",
      },
      {
        header: "IP Address",
        accessorKey: "ipAddress",
        size: 80,
      },
      {
        header: "User Agent",
        accessorKey: "userAgent",
      },
    ]}
    data={data ?? []}
  />
);

export default UserLogTable;

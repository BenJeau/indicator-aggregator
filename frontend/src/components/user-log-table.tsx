import dayjs from "dayjs";

import { DataTable } from "@/components";
import { DbUserLog } from "@/types/backendTypes";
import { useTranslation } from "@/i18n";

interface Props {
  data: DbUserLog[];
}

const UserLogTable: React.FC<Props> = ({ data }) => {
  const { t } = useTranslation();

  return (
    <DataTable
      columns={[
        {
          header: t("id"),
          accessorKey: "id",
          size: 60,
        },
        {
          header: t("time"),
          accessorKey: "createdAt",
          accessorFn: ({ createdAt }) => dayjs(createdAt).format("L LT"),
          size: 100,
        },
        {
          header: t("method"),
          accessorKey: "method",
          size: 50,
        },
        {
          header: t("uri"),
          accessorKey: "uri",
        },
        {
          header: t("ip.address"),
          accessorKey: "ipAddress",
          size: 80,
        },
        {
          header: t("user.agent"),
          accessorKey: "userAgent",
        },
      ]}
      data={data ?? []}
    />
  );
};

export default UserLogTable;

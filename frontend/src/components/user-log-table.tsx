import dayjs from "dayjs";
import { ExternalLink } from "lucide-react";

import { DataTable } from "@/components";
import { Button } from "@/components/ui/button";
import { DbUserLog } from "@/types/backendTypes";
import { useTranslation } from "@/i18n";
import config from "@/lib/config";

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
        {
          header: "",
          accessorKey: "traceId",
          cell: ({ getValue }) => (
            <Button className="ml-2 h-6 w-6 p-0" variant="secondary" asChild>
              <a
                href={`${config.opentel_url}/trace/${getValue()}`}
                target="_blank"
                rel="noreferrer noopener"
                className="flex"
              >
                <ExternalLink size={14} />
              </a>
            </Button>
          ),
          size: 50,
        },
      ]}
      data={data ?? []}
    />
  );
};

export default UserLogTable;

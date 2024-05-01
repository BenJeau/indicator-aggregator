import dayjs from "dayjs";

import { DataTable } from "@/components";
import { SourceProps } from "@/components/sources";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n";

interface PhishLabsData {
  details: {
    announcing_network: string;
    cidr_block: string;
    country: string;
    detail_time: string;
    ip_address: string;
    rir: string;
  }[];
  phish_detail_url: string;
  phish_id: number;
  submission_time: string;
  target: string;
  url: string;
  verification_time: string;
}

export const PhishTank: React.FC<SourceProps<PhishLabsData[]>> = ({ data }) => {
  const { t } = useTranslation();

  return (
    <DataTable
      columns={[
        {
          header: "ID",
          accessorKey: "phish_id",
          cell: ({ row }) => (
            <Button variant="link" asChild className="p-0 h-auto">
              <a
                href={row.original.phish_detail_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {row.original.phish_id}
              </a>
            </Button>
          ),
          size: 30,
        },
        {
          header: "URL",
          accessorKey: "url",
        },
        {
          header: t("target"),
          accessorKey: "target",
          size: 30,
        },
        {
          header: t("submission.time"),
          accessorKey: "submission_time",
          accessorFn: ({ submission_time }) =>
            dayjs(submission_time).format("L LT"),
          size: 50,
        },
        {
          header: t("verification.time"),
          accessorKey: "verification_time",
          accessorFn: ({ verification_time }) =>
            dayjs(verification_time).format("L LT"),
          size: 50,
        },
      ]}
      data={data ?? []}
    />
  );
};

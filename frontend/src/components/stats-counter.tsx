import { Link } from "@tanstack/react-router";
import { LucideIcon } from "lucide-react";

import { TransId, useTranslation } from "@/i18n";
import { Trans } from "@/components";

interface Props {
  Icon: LucideIcon;
  count: number;
  title: TransId;
  subCount: number;
  subTitle: TransId;
  to: string;
}

const StatsCounter: React.FC<Props> = ({
  Icon,
  count,
  title,
  subCount,
  subTitle,
  to,
}) => {
  const { t } = useTranslation();

  return (
    <Link to={to} title={`${t("search.results")}...`}>
      <div className="flex cursor-pointer items-center gap-4 rounded-xl border p-4 shadow-sm transition duration-100 ease-in-out hover:bg-muted">
        <div className="rounded-xl border bg-primary p-2">
          <Icon size={32} className="text-white dark:text-black" />
        </div>
        <div>
          <div className="-mb-1 flex items-baseline gap-2 font-semibold">
            <h5 className="text-xl">{count}</h5>
            <p className="text-lg">
              <Trans id={title} />
            </p>
          </div>
          <div className="flex items-baseline gap-2 opacity-50">
            <h5 className="text-sm">{subCount}</h5>
            <p className="text-sm">
              <Trans id={subTitle} />
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default StatsCounter;

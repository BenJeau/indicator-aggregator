import { LinkProps } from "@tanstack/react-router";
import { LucideIcon } from "lucide-react";

import { TransId, useTranslation } from "@/i18n";
import { Trans, AuthLink } from "@/components";

interface Props {
  Icon: LucideIcon;
  count: number;
  title: TransId;
  subCount: number;
  subTitle: TransId;
  to: LinkProps["to"];
  roles?: string[];
}

const StatsCounter: React.FC<Props> = ({
  Icon,
  count,
  title,
  subCount,
  subTitle,
  to,
  roles,
}) => {
  const { t } = useTranslation();

  return (
    <AuthLink to={to} title={`${t("search.results")}...`} roles={roles}>
      <div className="flex items-center gap-4 rounded-xl border p-4 shadow-sm transition duration-100 ease-in-out hover:bg-muted">
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
    </AuthLink>
  );
};

export default StatsCounter;

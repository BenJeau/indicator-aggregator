import { Power } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { RunnerStatus as IRunnerStatus } from "@/api/runners";
import {
  sourceKindIconMapping,
  runnerStatusBadgeVariantMapping,
  runnerStatusMapping,
} from "@/data";
import { cn, getConfigValue, getKeyByValue } from "@/lib/utils";
import { SourceKind, ServerConfigEntry } from "@/types/backendTypes";
import { Badge } from "@/components/ui/badge";
import { Trans } from "@/components";
import { useTranslation } from "@/i18n";

interface Props {
  sourceKind: SourceKind;
  status?: IRunnerStatus;
  address?: ServerConfigEntry<string>;
  enabled?: ServerConfigEntry<boolean>;
}

const RunnerStatus: React.FC<Props> = ({
  sourceKind,
  status,
  address,
  enabled,
}) => {
  const { t } = useTranslation();
  const Icon = sourceKindIconMapping[sourceKind];
  return (
    <Link
      to="/config"
      className="border rounded-xl p-4 shadow-sm flex gap-2 justify-between items-center hover:bg-muted transition-all duration-100 ease-in-out flex-wrap"
      title={t("runner.hover.title") + "..."}
    >
      <div className="flex gap-x-4 gap-y-2 items-center flex-wrap">
        <div
          className={cn(
            "rounded-lg w-8 h-8 flex items-center justify-center",
            enabled
              ? getConfigValue(enabled)
                ? "bg-green-500/20"
                : "bg-red-500/20"
              : "bg-muted"
          )}
        >
          <Power size={16} strokeWidth={2.54} />
        </div>
        <div>
          <h3 className="text-xl font-semibold flex gap-2">
            <Icon width={16} className="fill-foreground" />
            <Trans
              id="runner.title"
              kind={getKeyByValue(SourceKind, sourceKind)}
            />
          </h3>
          <p className="text-sm opacity-70 italic">
            {address ? getConfigValue(address) : "-"}
          </p>
        </div>
      </div>
      <Badge
        className="text-xs"
        variant={status ? runnerStatusBadgeVariantMapping[status] : "secondary"}
      >
        <Trans
          id={status ? runnerStatusMapping[status] : "runner.status.offline"}
        />
      </Badge>
    </Link>
  );
};

export default RunnerStatus;

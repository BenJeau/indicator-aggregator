import { Power } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { RunnerStatus as IRunnerStatus } from "@/api/runners";
import {
  sourceKindIconMapping,
  runnerStatusBadgeVariantMapping,
  runnerStatusMapping,
} from "@/lib/data";
import { cn } from "@/lib/utils";
import { SourceKind, ServerConfigEntry } from "@/types/backendTypes";
import { Badge } from "@/components/ui/badge";
import { Trans } from "@/components";
import { useTranslation } from "@/i18n";
import { getConfigValue, getKeyByValue } from "@/lib/config";

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
      className="flex flex-wrap items-center justify-between gap-2 rounded-xl border p-4 shadow-sm transition-all duration-100 ease-in-out hover:bg-muted"
      title={t("runner.hover.title") + "..."}
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg",
            enabled
              ? getConfigValue(enabled)
                ? "bg-green-500/20"
                : "bg-red-500/20"
              : "bg-muted",
          )}
        >
          <Power size={16} strokeWidth={2.54} />
        </div>
        <div>
          <h3 className="flex gap-2 text-xl font-semibold">
            <Icon width={16} className="fill-foreground" />
            <Trans
              id="runner.title"
              kind={getKeyByValue(SourceKind, sourceKind)}
            />
          </h3>
          <p className="text-sm italic opacity-70">
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

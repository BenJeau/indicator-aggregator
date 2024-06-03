import { LucideIcon } from "lucide-react";

import { Badge, BadgeProps } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TransId } from "@/i18n";
import { Trans } from "@/components";

interface Props {
  Icon?: LucideIcon;
  label?: TransId;
  value: React.ReactNode;
  valueBadgeProps?: BadgeProps;
}

const FullBadge: React.FC<Props> = ({
  Icon,
  label,
  value,
  valueBadgeProps,
}) => (
  <Badge className="bg-transparent p-0" variant="secondary">
    {(Icon || label) && (
      <span className="flex gap-2 px-2">
        {Icon && <Icon size={14} strokeWidth={3} />}
        {label && <Trans id={label} />}
      </span>
    )}
    <Badge
      {...valueBadgeProps}
      className={cn("gap-2", valueBadgeProps?.className)}
    >
      {value}
    </Badge>
  </Badge>
);

export default FullBadge;

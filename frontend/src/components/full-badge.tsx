import { LucideIcon } from "lucide-react";

import { Badge, BadgeProps } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Props {
  Icon?: LucideIcon;
  label?: React.ReactNode;
  value: React.ReactNode;
  valueBadgeProps?: BadgeProps;
}

const FullBadge: React.FC<Props> = ({
  Icon,
  label,
  value,
  valueBadgeProps,
}) => (
  <Badge className="p-0 bg-transparent" variant="secondary">
    {(Icon || label) && (
      <span className="px-2 gap-2 flex">
        {Icon && <Icon size={14} strokeWidth={3} />}
        {label}
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

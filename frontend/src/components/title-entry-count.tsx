import { cn } from "@/lib/utils";
import { Trans } from "@/components";

interface Props {
  count: number;
  className?: string;
}

const TitleEntryCount: React.FC<Props> = ({ count, className }) => (
  <span
    className={cn(
      "text-xs opacity-50 font-normal whitespace-nowrap lowercase",
      className,
    )}
  >
    {count.toLocaleString()} <Trans id={count > 1 ? "entries" : "entry"} />
  </span>
);

export default TitleEntryCount;

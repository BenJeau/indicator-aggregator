import { cn } from "@/lib/utils";
import { Trans } from "@/components";

interface Props {
  count: number;
  className?: string;
}

const TitleEntryCount: React.FC<Props> = ({ count, className }) => (
  <span
    className={cn(
      "whitespace-nowrap text-xs font-normal lowercase opacity-50",
      className,
    )}
  >
    {count.toLocaleString()} <Trans id={count > 1 ? "entries" : "entry"} />
  </span>
);

export default TitleEntryCount;

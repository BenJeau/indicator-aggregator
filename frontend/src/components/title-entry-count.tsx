import { cn } from "@/lib/utils";

interface Props {
  count: number;
  className?: string;
}

const TitleEntryCount: React.FC<Props> = ({ count, className }) => (
  <span
    className={cn(
      "text-xs opacity-50 font-normal whitespace-nowrap",
      className,
    )}
  >
    {count.toLocaleString()}
    {count > 1 ? " entries" : " entry"}
  </span>
);

export default TitleEntryCount;

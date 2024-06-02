import { ChevronLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Props {
  titleIcon?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  extra?: React.ReactNode;
  outerClassName?: string;
  className?: string;
  titleContainerClassName?: string;
  titleClassName?: string;
  extraClassName?: string;
  titleIconClassName?: string;
}

const SectionPanelHeader: React.FC<Props> = ({
  titleIcon,
  title,
  description,
  extra,
  outerClassName,
  className,
  titleContainerClassName,
  titleClassName,
  extraClassName,
  titleIconClassName,
}) => (
  <div className={outerClassName}>
    <div
      className={cn(
        "flex items-center justify-between gap-4 bg-muted/60 px-4 py-3",
        className,
      )}
    >
      <div
        className={cn(
          "flex gap-2",
          !titleIcon && "md:hidden",
          titleIconClassName,
        )}
      >
        <Link to=".." className="md:hidden">
          <Button className="h-8 w-8 p-0" variant="outline">
            <ChevronLeft size={16} />
          </Button>
        </Link>
        {titleIcon}
      </div>
      <div
        className={cn(
          "flex flex-1 items-baseline gap-2 overflow-hidden",
          titleContainerClassName,
        )}
      >
        {title && (
          <h3
            className={cn(
              "textl-xl items-center whitespace-nowrap font-semibold",
              titleClassName,
            )}
          >
            {title}
          </h3>
        )}
        {description && (
          <div className="flex-1 overflow-hidden overflow-ellipsis whitespace-nowrap text-xs">
            {description}
          </div>
        )}
      </div>
      {extra && (
        <div className={cn("flex items-center gap-2", extraClassName)}>
          {extra}
        </div>
      )}
    </div>
    <Separator orientation="horizontal" className="shadow" />
  </div>
);

export default SectionPanelHeader;

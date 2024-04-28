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
        "px-4 py-3 bg-muted/60 flex justify-between items-center gap-4",
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
          <Button className="p-0 w-8 h-8" variant="outline">
            <ChevronLeft size={16} />
          </Button>
        </Link>
        {titleIcon}
      </div>
      <div
        className={cn(
          "items-baseline flex flex-1 gap-2 overflow-hidden",
          titleContainerClassName,
        )}
      >
        {title && (
          <h3
            className={cn(
              "textl-xl font-semibold items-center whitespace-nowrap",
              titleClassName,
            )}
          >
            {title}
          </h3>
        )}
        {description && (
          <div className="text-xs overflow-hidden overflow-ellipsis whitespace-nowrap flex-1">
            {description}
          </div>
        )}
      </div>
      {extra && (
        <div className={cn("flex gap-2 items-center", extraClassName)}>
          {extra}
        </div>
      )}
    </div>
    <Separator orientation="horizontal" className="shadow" />
  </div>
);

export default SectionPanelHeader;

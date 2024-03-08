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
}

export const SectionPanelHeader: React.FC<Props> = ({
  titleIcon,
  title,
  description,
  extra,
  outerClassName,
  className,
  titleContainerClassName,
  titleClassName,
  extraClassName,
}) => (
  <div className={outerClassName}>
    <div
      className={cn(
        "px-4 py-3 bg-muted/60 flex justify-between items-center gap-4",
        className,
      )}
    >
      <div className="flex gap-2">
        <Link to=".." className="md:hidden">
          <Button className="p-0 w-8 h-8" variant="secondary">
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
        <h3
          className={cn(
            "textl-xl font-semibold items-center whitespace-nowrap",
            titleClassName,
          )}
        >
          {title}
        </h3>
        <div className="text-xs overflow-hidden overflow-ellipsis whitespace-nowrap flex-1">
          {description}
        </div>
      </div>
      <div className={cn("flex gap-2 items-center", extraClassName)}>
        {extra}
      </div>
    </div>
    <Separator orientation="horizontal" className="shadow" />
  </div>
);

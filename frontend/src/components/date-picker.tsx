import { format } from "date-fns";
import { Calendar as CalendarIcon, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar, CalendarProps } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Trans } from "@/components";

interface Props extends Omit<CalendarProps, "selected" | "mode"> {
  selected: Date;
  buttonClassName?: string;
}

const DatePicker: React.FC<Props> = (props) => (
  <Popover>
    <PopoverTrigger asChild>
      <Button
        variant={"outline"}
        className={cn(
          "w-full justify-start text-left font-normal relative",
          !props.selected && "text-muted-foreground",
          props.buttonClassName,
        )}
      >
        <CalendarIcon className="mr-2 h-4 w-4 min-w-4" />
        {props.selected ? (
          format(props.selected, "PPP")
        ) : (
          <span>
            <Trans id="pick.a.date" />
          </span>
        )}
        {props.selected && (
          <Button
            type="button"
            className="h-6 w-6 p-0 absolute right-1 top-[1px] bottom-0 hover:bg-transparent"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              // @ts-expect-error onSelect is optional
              props.onSelect && props.onSelect(null);
            }}
          >
            <X size={16} />
          </Button>
        )}
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-auto p-0">
      <Calendar mode="single" initialFocus {...props} />
    </PopoverContent>
  </Popover>
);

export default DatePicker;

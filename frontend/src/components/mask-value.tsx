import { Asterisk, EyeOff, Eye } from "lucide-react";
import { useMemo, useState } from "react";

import { AutoAnimate, CopyButton } from "@/components";
import { Button } from "@/components/ui/button";

interface Props {
  length?: number;
  value?: string;
  disableToggle?: boolean;
  onToggle?: (showValue: boolean) => void;
  copieable?: "whenShown" | "always" | "never";
}

const MaskValue: React.FC<Props> = ({
  length = 15,
  value,
  disableToggle = false,
  onToggle,
  copieable = "never",
}) => {
  const [showValue, setShowValue] = useState(false);

  const shouldShowCopyButton = useMemo(() => {
    if (copieable === "never") {
      return false;
    }

    if (copieable === "always") {
      return true;
    }

    return showValue;
  }, [copieable, showValue]);

  return (
    <div className="flex items-center justify-between gap-2">
      <AutoAnimate>
        {showValue ? (
          <code className="rounded-sm bg-foreground/5 px-1 dark:bg-foreground/30">
            {value}
          </code>
        ) : (
          <div className="flex">
            {Array.from({ length }, () => (
              <Asterisk size={12} className="-ml-1" />
            ))}
          </div>
        )}
      </AutoAnimate>
      {!disableToggle && (
        <div className="flex gap-2">
          {shouldShowCopyButton && <CopyButton text={value} />}
          <Button
            className="h-6 w-6 p-0"
            variant="ghost"
            type="button"
            onClick={() => {
              onToggle && onToggle(showValue);
              setShowValue((prev) => !prev);
            }}
          >
            {showValue ? <EyeOff size={14} /> : <Eye size={14} />}
          </Button>
        </div>
      )}
    </div>
  );
};

export default MaskValue;

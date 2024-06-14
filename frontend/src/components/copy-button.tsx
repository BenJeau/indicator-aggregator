import { Check, Copy } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  text?: string;
  iconSize?: number;
  className?: string;
}

const CopyButton: React.FC<Props> = ({
  text,
  iconSize = 14,
  className = "",
}) => {
  const [copied, setCopied] = useState(false);

  return (
    <Button
      variant="ghost"
      onClick={() => {
        if (text) {
          navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => {
            setCopied(false);
          }, 1500);
        }
      }}
      className={cn(
        "dark:bg-black-50 h-6 w-6 bg-white/50 p-0 backdrop-blur-md",
        copied ? "bg-green-300/50 text-green-700" : "",
        className,
      )}
      disabled={!text}
    >
      {copied ? <Check size={iconSize} /> : <Copy size={iconSize} />}
    </Button>
  );
};

export default CopyButton;

import { ChevronLeft, Home, LogOut } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Trans } from "@/components";
import { TransId } from "@/i18n";

interface Props {
  emoji?: string;
  title: string;
  subtitle: TransId;
  description: TransId;
  otherButtons?: React.ReactNode;
  data?: string;
}

const SimpleError: React.FC<Props> = ({
  emoji,
  title,
  subtitle,
  description,
  otherButtons,
  data,
}) => (
  <div className="flex h-full w-full flex-1 items-center justify-center self-center p-4">
    <div className="relative flex flex-col flex-wrap gap-4">
      {emoji && (
        <div className="absolute right-0 top-0 ms-4 select-none font-serif text-7xl font-bold leading-5 text-primary/30 sm:text-8xl md:text-9xl">
          {emoji}
        </div>
      )}
      <div className="ms-4 font-serif text-[10rem] font-bold leading-[10rem] text-primary dark:text-primary">
        {title}
      </div>
      <div className="w-full max-w-2xl">
        <div className="text-lg font-semibold">
          <Trans
            id={subtitle}
            data={<span className="italic opacity-50">{data}</span>}
          />
        </div>
        <div className="text-sm">
          <Trans id={description} />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Link to="../">
          <Button className="px-3" variant="outline">
            <ChevronLeft size={16} />
          </Button>
        </Link>
        <Button asChild>
          <Link to="/" className="flex-1 gap-2 shadow-md">
            <Home size={16} />
            <Trans id="go.home" />
          </Link>
        </Button>
        <Button asChild variant="secondary">
          <Link to="/auth/logout" className="gap-2">
            <LogOut size={16} />
            <Trans id="logout" />
          </Link>
        </Button>
        {otherButtons}
      </div>
    </div>
  </div>
);

export default SimpleError;

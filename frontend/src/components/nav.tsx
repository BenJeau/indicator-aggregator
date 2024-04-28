import { ExternalLinkIcon, LucideIcon } from "lucide-react";
import { Link, LinkProps } from "@tanstack/react-router";

import { cn } from "@/lib/utils";
import { ButtonProps, buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type BaseNavLinkProps = {
  title: React.ReactNode;
  label?: React.ReactNode;
  icon: LucideIcon;
  variant?: "default" | "ghost";
};

type ExtraNavLinkProps =
  | {
      href: string;
    }
  | {
      onClick: () => void;
      size?: ButtonProps["size"];
      disabled?: ButtonProps["disabled"];
    }
  | {
      to: string;
      preload?: LinkProps["preload"];
    };

type NavLinkProps = BaseNavLinkProps & ExtraNavLinkProps;

interface NavProps {
  isCollapsed: boolean;
  links: NavLinkProps[];
}

const LinkOrButtonOrExternalLink: React.FC<
  React.PropsWithChildren<ExtraNavLinkProps & { className?: string }>
> = (props) => {
  if ("to" in props && props.to !== undefined) {
    return <Link {...props} />;
  }

  if ("href" in props && props.href !== undefined) {
    return <a target="_blank" rel="noreferrer noopener" {...props} />;
  }

  return <div {...props} />;
};

const Nav: React.FC<NavProps> = ({ links, isCollapsed }) => (
  <div
    data-collapsed={isCollapsed}
    className="group flex flex-col gap-4 py-2 data-[collapsed=true]:py-2"
  >
    <nav className="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
      {links.map((link, index) =>
        isCollapsed ? (
          <Tooltip key={index} delayDuration={0}>
            <TooltipTrigger>
              <LinkOrButtonOrExternalLink
                className={cn(
                  buttonVariants({
                    variant: link.variant ?? "ghost",
                    size: "icon",
                  }),
                  "h-9 w-9",
                  link.variant === "default" &&
                    "dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white",
                  "disabled" in link &&
                    link.disabled &&
                    "opacity-50 cursor-default hover:bg-transparent hover:text-current",
                )}
                size="icon"
                {...link}
              >
                <link.icon className="h-4 w-4" />
                <span className="sr-only">{link.title}</span>
              </LinkOrButtonOrExternalLink>
            </TooltipTrigger>
            <TooltipContent side="right" className="flex items-center gap-2">
              {link.title}
              {link.label !== undefined && (
                <span className="ml-auto font-bold">{link.label}</span>
              )}
            </TooltipContent>
          </Tooltip>
        ) : (
          <LinkOrButtonOrExternalLink
            key={index}
            className={cn(
              buttonVariants({
                variant: link.variant ?? "ghost",
                size: "sm",
              }),
              "h-9 cursor-pointer",
              link.variant === "default" &&
                "dark:bg-muted dark:text-white dark:hover:bg-muted dark:hover:text-white",
              "justify-start",
            )}
            {...link}
          >
            <link.icon className="mr-2 h-4 w-4" />
            {link.title}
            {link.label !== undefined && (
              <span
                className={cn(
                  "ml-auto",
                  link.variant === "default" && "dark:text-white",
                )}
              >
                {link.label}
              </span>
            )}
            {"href" in link && link.href !== undefined && (
              <ExternalLinkIcon className="ml-auto" size={14} />
            )}
          </LinkOrButtonOrExternalLink>
        ),
      )}
    </nav>
  </div>
);

export default Nav;

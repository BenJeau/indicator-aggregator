import React, { useEffect, useMemo, useState } from "react";
import {
  BookOpenText,
  ChevronsLeft,
  ChevronsRight,
  Database,
  LogOut,
  ScrollText,
  Send,
  TrainFront,
  Cog,
  Globe,
  HelpCircle,
  Wrench,
  Bell,
  GanttChart,
  History,
  Users,
  Languages,
  Github,
} from "lucide-react";
import { useRouterState, Link, Outlet } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useAtom, useAtomValue } from "jotai";

import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeCycle, ThemeIcon, themeAtom } from "@/atoms/theme";
import { Button } from "@/components/ui/button";
import { statsCountQueryOptions } from "@/api/stats";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import TitleEntryCount from "@/components/title-entry-count";
import { notificationsQueryOptions } from "@/api/notifications";
import { Empty, Nav, Trans } from "@/components";
import NotifcationEmpty from "@/assets/resting-two-color.svg";
import config from "@/lib/config";
import { useWindowWidth } from "@/hooks/useWindowWidth";
import { userAtom } from "@/atoms/auth";
import { useTranslation } from "@/i18n";
import { userHasAnyRoles } from "@/lib/auth";

type Page =
  | "home"
  | "requests"
  | "sources"
  | "history"
  | "docs"
  | "providers"
  | "config"
  | "ignore.lists"
  | "users";

export const Layout: React.FC = () => {
  const [isButtonCollapsed, setIsButtonCollapsed] = useState(false);
  const { location } = useRouterState();
  const [theme, setTheme] = useAtom(themeAtom);
  const windowWidth = useWindowWidth();
  const user = useAtomValue(userAtom);
  const { t, toggle, otherLang } = useTranslation();

  const statsCount = useSuspenseQuery(statsCountQueryOptions);
  const notifications = useSuspenseQuery(notificationsQueryOptions);

  const page: Page | undefined = useMemo(() => {
    if (location.pathname.startsWith("/request")) return "requests";
    if (location.pathname.startsWith("/history")) return "history";
    if (location.pathname.startsWith("/sources")) return "sources";
    if (location.pathname.startsWith("/providers")) return "providers";
    if (location.pathname.startsWith("/lists")) return "ignore.lists";
    if (location.pathname.startsWith("/config")) return "config";
    if (location.pathname.startsWith("/docs")) return "docs";
    if (location.pathname.startsWith("/users")) return "users";
    if (location.pathname === "/") return "home";
    return undefined;
  }, [location.pathname]);

  useEffect(() => {
    document.title = page
      ? `${t(page)} - Indicator Aggregator`
      : "Indicator Aggregator";
  }, [page, t]);

  const togglePanel = () => {
    setIsButtonCollapsed((prev) => !prev);
  };

  const shouldBeCollapsed = windowWidth < 1200;
  const isCollapsed = shouldBeCollapsed || isButtonCollapsed;

  return (
    <div className="relative flex h-full w-screen overflow-hidden">
      <div
        className={cn(
          "z-20 flex h-full w-[270px] min-w-[270px] flex-col justify-between border-r shadow-lg transition-[width] duration-300 ease-out",
          isCollapsed && "w-14 min-w-14",
        )}
      >
        <div>
          <Link
            to="/"
            className={cn(
              "flex h-[52px] items-center gap-2 whitespace-nowrap bg-primary/20 font-medium text-primary transition-all hover:bg-primary/10",
              isCollapsed ? "justify-center" : "px-4",
              page === "home" &&
                "bg-primary/50 text-black hover:bg-primary/50 dark:bg-primary/50 dark:text-white",
            )}
            disabled={page === "home"}
          >
            <TrainFront strokeWidth={2.5} className="min-w-6" />
            <div className={cn(isCollapsed ? "hidden" : "")}>
              <span className="font-bold text-black dark:text-white">
                Indicator
              </span>{" "}
              Aggregator
            </div>
          </Link>
          <Separator />
          <Nav
            isCollapsed={isCollapsed}
            links={[
              {
                roles: ["request_create"],
                title: t("requests"),
                icon: Send,
                to: "/request",
                variant: page === "requests" ? "default" : "ghost",
                preload: false,
              },
              {
                roles: ["request_view"],
                title: t("history"),
                label: statsCount.data.history,
                icon: History,
                to: "/history",
                variant: page === "history" ? "default" : "ghost",
              },
            ]}
          />
          {userHasAnyRoles(user, ["request_create", "request_view"]) && (
            <div className={cn("mx-4", isCollapsed && "mx-2")}>
              <Separator />
            </div>
          )}
          <Nav
            isCollapsed={isCollapsed}
            links={[
              {
                title: t("sources"),
                label: statsCount.data.sources,
                to: "/sources",
                variant: page === "sources" ? "default" : "ghost",
                icon: Database,
              },
              {
                title: t("providers"),
                label: statsCount.data.providers,
                to: "/providers",
                variant: page === "providers" ? "default" : "ghost",
                icon: Globe,
              },
              {
                title: t("ignore.lists"),
                label: statsCount.data.ignoreLists,
                to: "/lists",
                variant: page === "ignore.lists" ? "default" : "ghost",
                icon: ScrollText,
              },
            ]}
          />
          <div className={cn("mx-4", isCollapsed && "mx-2")}>
            <Separator />
          </div>
          <Nav
            isCollapsed={isCollapsed}
            links={[
              {
                title: t("users"),
                label: statsCount.data.users,
                to: "/users",
                variant: page === "users" ? "default" : "ghost",
                icon: Users,
              },
              {
                title: t("config"),
                to: "/config",
                variant: page === "config" ? "default" : "ghost",
                icon: Cog,
              },
            ]}
          />
        </div>
        <div>
          <Nav
            isCollapsed={isCollapsed}
            links={[
              {
                title: "GitHub",
                href: "https://github.com/BenJeau/indicator-aggregator",
                variant: "ghost",
                icon: Github,
              },
              {
                title: t("tracing"),
                href: config.opentel_url,
                variant: "ghost",
                icon: GanttChart,
              },
              {
                title: t("docs"),
                to: "/docs",
                variant: page === "docs" ? "default" : "ghost",
                icon: BookOpenText,
              },
            ]}
          />
          <div className={cn("mx-4", isCollapsed && "mx-2")}>
            <Separator />
          </div>
          <Nav
            isCollapsed={isCollapsed}
            links={[
              {
                title:
                  t(isCollapsed ? "expand" : "collapse") +
                  " nav" +
                  (shouldBeCollapsed ? " (" + t("screen.too.small") + ")" : ""),
                icon: isCollapsed ? ChevronsRight : ChevronsLeft,
                onClick: togglePanel,
                disabled: shouldBeCollapsed,
              },
            ]}
          />
          <div className={cn("mx-4", isCollapsed && "mx-2")}>
            <Separator />
          </div>
          <Nav
            isCollapsed={isCollapsed}
            links={[
              {
                title: t("change.to") + " " + otherLang.lang.lang,
                icon: Languages,
                onClick: toggle,
              },
              {
                title: t(`theme.${ThemeCycle[theme]}`),
                icon: ThemeIcon[ThemeCycle[theme]],
                onClick: () => {
                  setTheme((prev) => ThemeCycle[prev]);
                },
              },
              {
                title: t("logout"),
                icon: LogOut,
                to: "/auth/logout",
                preload: false,
              },
            ]}
          />
          <Separator />
          <div
            className={cn(
              "flex items-center gap-2 bg-muted/50 py-4",
              isCollapsed ? "justify-center" : "px-4",
            )}
          >
            <Avatar className="border">
              <AvatarImage alt="@shadcn" />
              <AvatarFallback>{user!.initials}</AvatarFallback>
            </Avatar>
            <div className={cn("flex flex-col", isCollapsed && "hidden")}>
              <span className="block whitespace-nowrap font-semibold">
                {user!.name}
              </span>
              <span className="block text-xs opacity-70">{user!.email}</span>
            </div>
          </div>
        </div>
      </div>
      {/* Unsure if width calc will always work.... w-full is weird since it doesn't take into account the sidenav */}
      <div
        className={cn(
          "flex h-full flex-col",
          isCollapsed ? "w-[calc(100%-3.5rem)]" : "w-[calc(100%-270px)]",
        )}
      >
        <div className="flex min-h-[52px] w-full items-center justify-between gap-2 bg-background px-4 py-2">
          <div className="flex items-baseline gap-2 overflow-hidden">
            <h1 className="whitespace-nowrap text-xl font-bold">
              {page && t(page)}
            </h1>
            <p
              className="overflow-hidden overflow-ellipsis whitespace-nowrap text-xs opacity-70"
              title={page && t(`layout.${page}.description`)}
            >
              {page && t(`layout.${page}.description`)}
            </p>
          </div>
          <div className="flex gap-2">
            {page !== "docs" && (
              <Link to="/docs" hash={page}>
                <Button variant="ghost" size="sm">
                  <HelpCircle size={16} />
                </Button>
              </Link>
            )}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={
                    notifications.data.length > 0 ? "destructive" : "ghost"
                  }
                  size="sm"
                  className="gap-2"
                >
                  <Bell size={16} />
                  {notifications.data.length > 0 && (
                    <span>{notifications.data.length}</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                className="min-w-96 overflow-hidden p-0"
              >
                <h2 className="flex items-baseline gap-2 border-b bg-background p-2 font-semibold">
                  <Trans id="notifications" />
                  <TitleEntryCount
                    count={notifications.data.length}
                    className="font-normal"
                  />
                </h2>
                <div className="flex flex-col gap-2 p-2">
                  {notifications.data.map(({ content, kind }, index) => {
                    if (kind === "MISSING_REQUIRED_SOURCE_SECRET") {
                      return (
                        <React.Fragment key={index}>
                          {index !== 0 && <Separator />}
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex flex-col">
                              <h3 className="text-sm">
                                <Trans id="notification.missing.secrets.title" />
                              </h3>
                              <p className="text-xs opacity-50">
                                <Trans
                                  id="notification.missing.secrets.description"
                                  name={
                                    <span className="font-semibold">
                                      {content.name}
                                    </span>
                                  }
                                  number={
                                    <span className="font-semibold">
                                      {content.numMissingSecrets}
                                    </span>
                                  }
                                />
                              </p>
                            </div>
                            <PopoverClose asChild>
                              <Link
                                to="/sources/$slug/edit"
                                params={{ slug: content.slug }}
                              >
                                <Button variant="ghost" size="sm">
                                  <Wrench size={14} />
                                </Button>
                              </Link>
                            </PopoverClose>
                          </div>
                        </React.Fragment>
                      );
                    }
                    return null;
                  })}
                  {notifications.data.length === 0 && (
                    <Empty
                      image={NotifcationEmpty}
                      imageWidth={150}
                      title="no.notifications.title"
                      description="no.notifications.description"
                      className="my-8"
                    />
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <Separator />
        <div className="flex flex-1 flex-col gap-2 overflow-y-scroll">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

import { useEffect, useMemo, useState } from "react";
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
} from "lucide-react";
import { useRouterState, Link, Outlet } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import React from "react";
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
import { Empty, Nav } from "@/components";
import NotifcationEmpty from "@/assets/resting-two-color.svg";
import config from "@/config";
import { useWindowWidth } from "@/hooks/useWindowWidth";
import { userAtom } from "@/atoms/auth";

type Page =
  | "home"
  | "request"
  | "sources"
  | "history"
  | "docs"
  | "providers"
  | "config"
  | "lists"
  | "users";

const PageDescription: { [key in Page]: string } = {
  home: "Overview of the Indicator Aggregator",
  request:
    "Make requests against all available sources for the specified indicator and it's kind",
  history: "View the history of all the requests made",
  sources: "Providing a variety of data for the different indicators",
  docs: "View the documentation about the Indicator Aggregator REST and gRPC APIs, alongside how to configure and create sources",
  providers: "Organisations that provides data for the different sources",
  config: "Global server configuration",
  lists: "Set of lists of indicators to ignore",
  users: "Manage users and their roles",
};

const PageTitle: { [key in Page]: string } = {
  home: "Home",
  request: "Request",
  history: "History",
  sources: "Sources",
  docs: "Documentation",
  providers: "Providers",
  config: "Configuration",
  lists: "Ignore lists",
  users: "Users",
};

export const Layout: React.FC = () => {
  const [isButtonCollapsed, setIsButtonCollapsed] = useState(false);
  const { location } = useRouterState();
  const [theme, setTheme] = useAtom(themeAtom);
  const windowWidth = useWindowWidth();
  const auth = useAtomValue(userAtom);

  const statsCount = useSuspenseQuery(statsCountQueryOptions);
  const notifications = useSuspenseQuery(notificationsQueryOptions);

  const page: Page | undefined = useMemo(() => {
    if (location.pathname.startsWith("/request")) return "request";
    if (location.pathname.startsWith("/history")) return "history";
    if (location.pathname.startsWith("/sources")) return "sources";
    if (location.pathname.startsWith("/providers")) return "providers";
    if (location.pathname.startsWith("/lists")) return "lists";
    if (location.pathname.startsWith("/config")) return "config";
    if (location.pathname.startsWith("/docs")) return "docs";
    if (location.pathname.startsWith("/users")) return "users";
    if (location.pathname === "/") return "home";
    return undefined;
  }, [location.pathname]);

  useEffect(() => {
    document.title = page
      ? `${PageTitle[page]} - Indicator Aggregator`
      : "Indicator Aggregator";
  }, [page]);

  const togglePanel = () => {
    setIsButtonCollapsed((prev) => !prev);
  };

  const shouldBeCollapsed = windowWidth < 1200;
  const isCollapsed = shouldBeCollapsed || isButtonCollapsed;

  return (
    <div className="relative flex h-full w-screen overflow-hidden">
      <div
        className={cn(
          "flex h-full w-[270px] min-w-[270px] flex-col justify-between border-r shadow-lg transition-[width] duration-300 ease-out",
          isCollapsed && "w-14 min-w-14",
        )}
      >
        <div>
          <Link
            to="/"
            className={cn(
              "bg-primary/20 text-primary hover:bg-primary/10 flex h-[52px] items-center gap-2 whitespace-nowrap font-medium transition-all",
              isCollapsed ? "justify-center" : "px-4",
              page === "home" &&
                "hover:bg-primary/50 bg-primary/50 dark:bg-primary/50 text-black dark:text-white",
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
                title: "Request",
                icon: Send,
                to: "/request",
                variant: page === "request" ? "default" : "ghost",
                preload: false,
              },
              {
                title: "History",
                label: statsCount.data.history,
                icon: History,
                to: "/history",
                variant: page === "history" ? "default" : "ghost",
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
                title: "Sources",
                label: statsCount.data.sources,
                to: "/sources",
                variant: page === "sources" ? "default" : "ghost",
                icon: Database,
              },
              {
                title: "Providers",
                label: statsCount.data.providers,
                to: "/providers",
                variant: page === "providers" ? "default" : "ghost",
                icon: Globe,
              },
              {
                title: "Ignore lists",
                label: statsCount.data.ignoreLists,
                to: "/lists",
                variant: page === "lists" ? "default" : "ghost",
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
                title: "Server config",
                to: "/config",
                variant: page === "config" ? "default" : "ghost",
                icon: Cog,
              },
              {
                title: "Users",
                to: "/users",
                variant: page === "users" ? "default" : "ghost",
                icon: Users,
              },
            ]}
          />
        </div>
        <div>
          <Nav
            isCollapsed={isCollapsed}
            links={[
              {
                title: "Tracing",
                href: config.opentel_url,
                variant: "ghost",
                icon: GanttChart,
              },
              {
                title: "Documentation",
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
                  (isCollapsed ? "Expand" : "Collapse") +
                  " nav" +
                  (shouldBeCollapsed ? " (screen too small)" : ""),
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
                title:
                  theme === "dark"
                    ? "Light theme"
                    : theme === "light"
                      ? "System theme"
                      : "Dark theme",
                icon: ThemeIcon[ThemeCycle[theme]],
                onClick: () => setTheme((prev) => ThemeCycle[prev]),
              },
              {
                title: "Logout",
                icon: LogOut,
                to: "/logout",
                preload: false,
              },
            ]}
          />
          <Separator />
          <div
            className={cn(
              "bg-muted/50 flex  items-center gap-2 py-4",
              isCollapsed ? "justify-center" : "px-4",
            )}
          >
            <Avatar className="border">
              <AvatarImage alt="@shadcn" />
              <AvatarFallback>
                {auth!.givenName[0] + auth!.familyName[0]}
              </AvatarFallback>
            </Avatar>
            <div className={cn("flex flex-col", isCollapsed && "hidden")}>
              <span className="block whitespace-nowrap font-semibold">
                {auth?.name}
              </span>
              <span className="block text-xs opacity-70">{auth?.email}</span>
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
        <div className="bg-background flex min-h-[52px] w-full items-center justify-between gap-2 px-4 py-2">
          <div className="flex items-baseline gap-2 overflow-hidden">
            <h1 className="whitespace-nowrap text-xl font-bold">
              {page && PageTitle[page]}
            </h1>
            <p
              className="overflow-hidden overflow-ellipsis whitespace-nowrap text-xs opacity-70"
              title={page && PageDescription[page]}
            >
              {page && PageDescription[page]}
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
                <h2 className="bg-background flex items-baseline gap-2 border-b p-2 font-semibold">
                  Notifications
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
                                Missing required source secret
                              </h3>
                              <p className="text-xs opacity-50">
                                Need to link{" "}
                                <span className="font-semibold">
                                  {content.name}
                                </span>{" "}
                                with{" "}
                                <span className="font-semibold">
                                  {content.numMissingSecrets}
                                </span>{" "}
                                secrets
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
                      title="No notifications"
                      description="Everything is smooth sailing"
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

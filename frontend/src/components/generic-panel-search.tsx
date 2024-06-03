import { Link, Outlet, useMatches } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, LucideIcon, Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Empty } from "@/components";
import { TransId, useTranslation } from "@/i18n";

export interface ComponentSearchResultProps<T> {
  data: T;
}

interface Props<T> {
  data: T[];
  onFilter: (data: T, seachValue: string) => boolean;
  searchPlaceholder: TransId;
  createLinkTo?: string;
  CreateLinkIcon?: LucideIcon;
  Item: React.FC<ComponentSearchResultProps<T>>;
  empty: {
    title: TransId;
    description: TransId;
    extra?: React.ReactNode;
  };
}

function GenericPanelSearch<T>({
  data,
  onFilter,
  searchPlaceholder,
  createLinkTo,
  CreateLinkIcon = Plus,
  Item,
  empty,
}: Props<T>) {
  const [searchValue, setSearchValue] = useState("");
  const { t } = useTranslation();

  const filteredData = data.filter((data) => onFilter(data, searchValue));

  const matches = useMatches();

  const isDetailsView =
    matches[matches.length - 1]?.pathname.split("/").filter(Boolean).length > 1;

  return (
    <ResizablePanelGroup
      autoSaveId="side-panel"
      direction="horizontal"
      className="h-full flex-1 items-stretch"
      style={{ overflow: "auto" }}
    >
      <ResizablePanel
        minSize={30}
        className={cn(
          "flex h-full flex-1 flex-col shadow-md md:flex",
          isDetailsView && "hidden",
        )}
      >
        <div className="h-14 bg-muted/25 shadow">
          <div className="flex h-full items-center gap-2 px-4">
            <Link to="/" className="flex md:hidden">
              <Button className="h-8 w-8 p-0" variant="outline">
                <ChevronLeft size={16} />
              </Button>
            </Link>
            <Input
              placeholder={t(searchPlaceholder) + "..."}
              value={searchValue}
              className="h-8 bg-background"
              onChange={(e) => setSearchValue(e.target.value)}
            />
            {createLinkTo && (
              <Link to={createLinkTo}>
                <Button className="h-8 w-8 p-0">
                  <CreateLinkIcon size={16} />
                </Button>
              </Link>
            )}
          </div>
          <Separator />
        </div>
        {filteredData.length === 0 ? (
          <div className="flex h-full flex-1 flex-col items-center justify-center">
            <Empty
              title={empty.title}
              description={empty.description}
              extra={
                createLinkTo && (
                  <Link to={createLinkTo} search={{ name: searchValue }}>
                    <Button variant="secondary" size="sm" className="gap-2">
                      <CreateLinkIcon size={16} />
                      {empty.extra}
                    </Button>
                  </Link>
                )
              }
            />
          </div>
        ) : (
          <div className="flex-1 overflow-y-scroll">
            <div className={cn("grid grid-cols-1 gap-2 p-4")}>
              {filteredData.map((data, index) => (
                <Item key={index} data={data} />
              ))}
            </div>
          </div>
        )}
      </ResizablePanel>
      <ResizableHandle className="hidden md:block" />
      <ResizablePanel
        minSize={50}
        className={cn("flex-1 flex-col md:flex", !isDetailsView && "hidden")}
      >
        <Outlet />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

export default GenericPanelSearch;

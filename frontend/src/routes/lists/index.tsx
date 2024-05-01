import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Scroll } from "lucide-react";

import EmptyImage from "@/assets/files-and-folder-two-color.svg";
import { Empty, SectionPanelHeader, Trans } from "@/components";
import { Button } from "@/components/ui/button";
import { beforeLoadAuthenticated } from "@/auth";

const ListHomeComponent: React.FC = () => (
  <>
    <SectionPanelHeader
      title={<Trans id="ignore.list.section.panel.title" />}
      titleIcon={
        <div className="rounded-lg p-2 bg-black/10 dark:bg-black/50">
          <Scroll size={16} strokeWidth={2.54} />
        </div>
      }
      className="h-14"
    />
    <Empty
      title="ignore.list.empty.title"
      description="ignore.list.empty.description"
      image={EmptyImage}
      extra={
        <Link to="/lists/new">
          <Button className="gap-2" size="sm" variant="secondary">
            <Plus size={16} />
            <Trans id="ignore.list.empty.extra" />
          </Button>
        </Link>
      }
    />
  </>
);

export const Route = createFileRoute("/lists/")({
  component: ListHomeComponent,
  beforeLoad: beforeLoadAuthenticated(),
});

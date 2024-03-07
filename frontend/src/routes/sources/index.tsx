import { createFileRoute, Link } from "@tanstack/react-router";
import { DatabaseZap, Plus } from "lucide-react";

import EmptyImage from "@/assets/hiking-two-color-e83a0.svg";
import { Empty } from "@/components/empty";
import { SectionPanelHeader } from "@/components/section-panel-header";
import { Button } from "@/components/ui/button";

const SourceHomeComponent: React.FC = () => (
  <>
    <SectionPanelHeader
      title="Source selection"
      titleIcon={
        <div className="rounded-lg p-2 bg-black/10 dark:bg-black/50">
          <DatabaseZap size={16} strokeWidth={2.54} />
        </div>
      }
      className="h-14"
    />
    <Empty
      title="Learn more about sources"
      description="Select a source on the side or create one below"
      image={EmptyImage}
      extra={
        <Link to="/sources/new">
          <Button className="gap-2" size="sm" variant="secondary">
            <Plus size={16} />
            Create source
          </Button>
        </Link>
      }
    />
  </>
);

export const Route = createFileRoute("/sources/")({
  component: SourceHomeComponent,
});

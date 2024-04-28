import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Scroll } from "lucide-react";

import EmptyImage from "@/assets/files-and-folder-two-color.svg";
import { Empty, SectionPanelHeader } from "@/components";
import { Button } from "@/components/ui/button";

const ListHomeComponent: React.FC = () => (
  <>
    <SectionPanelHeader
      title="Ignore list selection"
      titleIcon={
        <div className="rounded-lg p-2 bg-black/10 dark:bg-black/50">
          <Scroll size={16} strokeWidth={2.54} />
        </div>
      }
      className="h-14"
    />
    <Empty
      title="Learn more about ignore lists"
      description="Select an ignore list on the side or create one below"
      image={EmptyImage}
      extra={
        <Link to="/lists/new">
          <Button className="gap-2" size="sm" variant="secondary">
            <Plus size={16} />
            Create ignore list
          </Button>
        </Link>
      }
    />
  </>
);

export const Route = createFileRoute("/lists/")({
  component: ListHomeComponent,
});

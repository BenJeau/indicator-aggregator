import { createFileRoute, Link } from "@tanstack/react-router";
import { DatabaseZap, Plus } from "lucide-react";

import EmptyImage from "@/assets/hiking-two-color-e83a0.svg";
import { Empty, SectionPanelHeader, Trans } from "@/components";
import { Button } from "@/components/ui/button";
import { beforeLoadAuthenticated } from "@/auth";

const SourceHomeComponent: React.FC = () => (
  <>
    <SectionPanelHeader
      title={<Trans id="sources.section.panel.title" />}
      titleIcon={
        <div className="rounded-lg p-2 bg-black/10 dark:bg-black/50">
          <DatabaseZap size={16} strokeWidth={2.54} />
        </div>
      }
      className="h-14"
    />
    <Empty
      title="sources.empty.title"
      description="sources.empty.description"
      image={EmptyImage}
      extra={
        <Link to="/sources/new">
          <Button className="gap-2" size="sm" variant="secondary">
            <Plus size={16} />
            <Trans id="sources.empty.extra" />
          </Button>
        </Link>
      }
    />
  </>
);

export const Route = createFileRoute("/sources/")({
  component: SourceHomeComponent,
  beforeLoad: beforeLoadAuthenticated(),
});

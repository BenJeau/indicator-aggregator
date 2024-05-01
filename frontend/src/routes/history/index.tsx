import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, Send } from "lucide-react";

import EmptyImage from "@/assets/network-two-color-c4988.svg";
import { SectionPanelHeader, Empty, Trans } from "@/components";
import { Button } from "@/components/ui/button";
import { beforeLoadAuthenticated } from "@/auth";

const HistoryHomeComponent: React.FC = () => (
  <>
    <SectionPanelHeader
      title={<Trans id="history.section.panel.title" />}
      titleIcon={
        <div className="rounded-lg p-2 bg-black/10 dark:bg-black/50">
          <Clock size={16} strokeWidth={2.54} />
        </div>
      }
      className="h-14"
    />
    <Empty
      title="history.empty.title"
      description="history.empty.description"
      image={EmptyImage}
      extra={
        <Link to="/request">
          <Button className="gap-2" size="sm" variant="secondary">
            <Send size={16} />
            <Trans id="history.search.empty.extra" />
          </Button>
        </Link>
      }
    />
  </>
);

export const Route = createFileRoute("/history/")({
  component: HistoryHomeComponent,
  beforeLoad: beforeLoadAuthenticated(),
});

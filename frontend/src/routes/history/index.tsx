import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, Send } from "lucide-react";

import EmptyImage from "@/assets/network-two-color-c4988.svg";
import { SectionPanelHeader, Empty } from "@/components";
import { Button } from "@/components/ui/button";

const HistoryHomeComponent: React.FC = () => (
  <>
    <SectionPanelHeader
      title="Request selection"
      titleIcon={
        <div className="rounded-lg p-2 bg-black/10 dark:bg-black/50">
          <Clock size={16} strokeWidth={2.54} />
        </div>
      }
      className="h-14"
    />
    <Empty
      title="Learn more about past request"
      description="Select an old request on the side to view it's related data"
      image={EmptyImage}
      extra={
        <Link to="/request">
          <Button className="gap-2" size="sm" variant="secondary">
            <Send size={16} />
            Send a request
          </Button>
        </Link>
      }
    />
  </>
);

export const Route = createFileRoute("/history/")({
  component: HistoryHomeComponent,
});

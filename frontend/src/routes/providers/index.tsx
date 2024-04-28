import { createFileRoute, Link } from "@tanstack/react-router";
import { Globe2, Plus } from "lucide-react";

import EmptyImage from "@/assets/surfing-two-color-6c783.svg";
import { Empty, SectionPanelHeader } from "@/components";
import { Button } from "@/components/ui/button";

const ProviderHomeComponent: React.FC = () => (
  <>
    <SectionPanelHeader
      title="Provider selection"
      titleIcon={
        <div className="rounded-lg p-2 bg-black/10 dark:bg-black/50">
          <Globe2 size={16} strokeWidth={2.54} />
        </div>
      }
      className="h-14"
    />
    <Empty
      title="Learn more about providers"
      description="Select a provider on the side or create one below"
      image={EmptyImage}
      extra={
        <Link to="/providers/new">
          <Button className="gap-2" size="sm" variant="secondary">
            <Plus size={16} />
            Create provider
          </Button>
        </Link>
      }
    />
  </>
);

export const Route = createFileRoute("/providers/")({
  component: ProviderHomeComponent,
});

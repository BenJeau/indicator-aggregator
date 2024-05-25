import { createFileRoute, Link } from "@tanstack/react-router";
import { Globe2, Plus } from "lucide-react";

import EmptyImage from "@/assets/surfing-two-color-6c783.svg";
import { Empty, SectionPanelHeader, Trans } from "@/components";
import { Button } from "@/components/ui/button";
import { beforeLoadAuthenticated } from "@/lib/auth";

const ProviderHomeComponent: React.FC = () => (
  <>
    <SectionPanelHeader
      title={<Trans id="providers.section.panel.title" />}
      titleIcon={
        <div className="rounded-lg p-2 bg-black/10 dark:bg-black/50">
          <Globe2 size={16} strokeWidth={2.54} />
        </div>
      }
      className="h-14"
    />
    <Empty
      title="providers.empty.title"
      description="providers.empty.description"
      image={EmptyImage}
      extra={
        <Link to="/providers/new">
          <Button className="gap-2" size="sm" variant="secondary">
            <Plus size={16} />
            <Trans id="providers.empty.extra" />
          </Button>
        </Link>
      }
    />
  </>
);

export const Route = createFileRoute("/providers/")({
  component: ProviderHomeComponent,
  beforeLoad: beforeLoadAuthenticated(),
});

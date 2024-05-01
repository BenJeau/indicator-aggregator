import { createFileRoute } from "@tanstack/react-router";
import { UserCircle } from "lucide-react";

import EmptyImage from "@/assets/diversity-29.svg";
import { Empty, SectionPanelHeader, Trans } from "@/components";
import { beforeLoadAuthenticated } from "@/auth";

const UserHomeComponent: React.FC = () => (
  <>
    <SectionPanelHeader
      title={<Trans id="users.section.panel.title" />}
      titleIcon={
        <div className="rounded-lg p-2 bg-black/10 dark:bg-black/50">
          <UserCircle size={16} strokeWidth={2.54} />
        </div>
      }
      className="h-14"
    />
    <Empty
      title="users.empty.title"
      description="users.empty.description"
      image={EmptyImage}
      imageWidth={400}
    />
  </>
);

export const Route = createFileRoute("/users/")({
  component: UserHomeComponent,
  beforeLoad: beforeLoadAuthenticated(),
});

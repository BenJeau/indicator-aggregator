import { Outlet, createFileRoute } from "@tanstack/react-router";

import { Layouts } from "@/components";

export const Route = createFileRoute("/auth")({
  component: () => (
    <Layouts.Authentication>
      <Outlet />
    </Layouts.Authentication>
  ),
});

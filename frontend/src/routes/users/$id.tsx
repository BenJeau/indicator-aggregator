import {
  Link,
  Outlet,
  createFileRoute,
  useMatches,
} from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import {
  CalendarClock,
  Database,
  Edit,
  Mail,
  Network,
  Power,
  UserCheck,
} from "lucide-react";
import { useMemo } from "react";

import {
  FullBadge,
  SectionPanelHeader,
  TitleEntryCount,
  Trans,
  UserLogTable,
} from "@/components";
import { userLogsQueryOptions, userQueryOptions } from "@/api/users";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { beforeLoadAuthenticated } from "@/lib/auth";

const UserComponent: React.FC = () => {
  const { id } = Route.useParams();

  const user = useSuspenseQuery(userQueryOptions(id));
  const userLogs = useSuspenseQuery(userLogsQueryOptions(id));

  const firstRole = user.data.roles[0];
  const otherRoles = user.data.roles.slice(1);

  const matches = useMatches();
  const isEdit = useMemo(
    () => matches.some((i) => i.routeId === "/users/$id/edit"),
    [matches],
  );

  return (
    <div className="relative flex h-full flex-1 flex-col">
      <SectionPanelHeader
        titleIcon={
          <div
            className={cn(
              "rounded-lg p-2",
              user.data.enabled ? "bg-green-500/20" : "bg-red-500/20",
            )}
          >
            <Power size={16} strokeWidth={2.54} />
          </div>
        }
        title={<div className="flex items-center gap-2">{user.data.name}</div>}
        description={dayjs.utc(user.data.createdAt).format("lll")}
        extra={
          <Link to="/users/$id/edit" params={{ id }}>
            <Button variant="ghost" className="gap-2" size="sm" type="button">
              <Edit size={16} />
              <Trans id="edit" />
            </Button>
          </Link>
        }
      />
      <div className={cn(!isEdit && "overflow-y-scroll")}>
        <div className="flex flex-col gap-2 p-4">
          <div
            className={cn(
              "flex flex-1 flex-col gap-2 transition-all",
              isEdit && "pointer-events-none select-none opacity-20 blur-sm",
            )}
          >
            <div className="flex flex-wrap gap-2">
              <FullBadge
                Icon={CalendarClock}
                label="created.date"
                value={dayjs.utc(user.data.createdAt).local().format("LLL")}
              />
              <FullBadge
                Icon={CalendarClock}
                label="updated.date"
                value={dayjs.utc(user.data.updatedAt).local().format("LLL")}
              />
            </div>
            <Separator className="mt-2" />
            <div className="mt-2 flex flex-wrap gap-2">
              <FullBadge
                Icon={UserCheck}
                label="verified"
                valueBadgeProps={{
                  variant: "secondary",
                }}
                value={user.data.verified ? "Yes" : "No"}
              />
              <FullBadge
                Icon={Mail}
                label="email"
                valueBadgeProps={{
                  variant: "secondary",
                }}
                value={user.data.email}
              />
              <FullBadge
                Icon={Database}
                label="provider"
                valueBadgeProps={{
                  variant: "secondary",
                }}
                value={user.data.provider}
              />
              <FullBadge
                Icon={Database}
                label="provider.user.id"
                valueBadgeProps={{
                  variant: "secondary",
                }}
                value={user.data.authId}
              />
              <FullBadge
                Icon={Network}
                label="roles"
                valueBadgeProps={{
                  variant: "secondary",
                }}
                value={
                  firstRole ?? <i className="opacity-50 font-normal">none</i>
                }
              />
              {otherRoles.map((role) => (
                <FullBadge
                  key={role}
                  valueBadgeProps={{
                    variant: "secondary",
                  }}
                  value={role}
                />
              ))}
            </div>
            <Separator className="mt-2" />

            <h2 className="mt-2 flex items-baseline gap-2 font-medium">
              <Trans id="logs" />
              <TitleEntryCount count={userLogs.data.length} />
            </h2>
            <UserLogTable data={userLogs.data} />
          </div>
        </div>
      </div>
      <div className={cn("absolute left-0 right-0 top-0", isEdit && "h-full")}>
        <Outlet />
      </div>
    </div>
  );
};

export const Route = createFileRoute("/users/$id")({
  component: UserComponent,
  beforeLoad: beforeLoadAuthenticated(),
  loader: async ({ context: { queryClient }, params: { id } }) => {
    await Promise.all([
      queryClient.ensureQueryData(userQueryOptions(id)),
      queryClient.ensureQueryData(userLogsQueryOptions(id)),
    ]);
  },
});

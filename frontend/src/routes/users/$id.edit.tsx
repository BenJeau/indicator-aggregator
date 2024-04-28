import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { useUserPatch, userQueryOptions } from "@/api/users";
import { Forms } from "@/components";
import { beforeLoadAuthenticated } from "@/auth";

const UserEditComponent: React.FC = () => {
  const { id } = Route.useParams();

  const navigate = useNavigate();
  const user = useSuspenseQuery(userQueryOptions(id));

  const patchUser = useUserPatch();

  const onSubmit = async (values: Forms.UserEdit.FormSchema) => {
    await patchUser.mutateAsync({
      id,
      data: values,
    });
    toast.success("User updated");
    navigate({ to: "/users/$id", params: { id } });
  };

  return <Forms.UserEdit.default user={user.data} onSubmit={onSubmit} />;
};

export const Route = createFileRoute("/users/$id/edit")({
  component: UserEditComponent,
  beforeLoad: beforeLoadAuthenticated(),
  loader: async ({ context: { queryClient }, params: { id } }) => {
    await queryClient.ensureQueryData(userQueryOptions(id));
  },
});

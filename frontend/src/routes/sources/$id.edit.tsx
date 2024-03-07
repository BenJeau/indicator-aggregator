import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { FormSchema, SourceEditCreate } from "@/components/source-edit-create";
import {
  sourceIgnoreListsQueryOptions,
  sourceQueryOptions,
  sourceSecretsQueryOptions,
  useDeleteSourceMutation,
  usePutSourceIgnoreListMutation,
  usePutSourceSecretsMutation,
  useUpdateSourceMutation,
} from "@/api/sources";
import { SourceKind } from "@/types/backendTypes";

const SourceEditComponent: React.FC = () => {
  const navigate = useNavigate();
  const { id } = Route.useParams();

  const source = useSuspenseQuery(sourceQueryOptions(id));
  const sourceIgnoreLists = useSuspenseQuery(sourceIgnoreListsQueryOptions(id));
  const sourceSecrets = useSuspenseQuery(sourceSecretsQueryOptions(id));

  const deleteSource = useDeleteSourceMutation();
  const updateSource = useUpdateSourceMutation();
  const putSourceIgnoreLists = usePutSourceIgnoreListMutation();
  const putSourceSecrets = usePutSourceSecretsMutation();

  const onSubmit = async (values: FormSchema) => {
    const updateData = {
      ...values,
      config: [],
      configValues: [],
      kind: values.kind as SourceKind,
      ignoreLists: undefined,
      sourceSecrets: undefined,
    };

    delete updateData.ignoreLists;
    delete updateData.sourceSecrets;

    await Promise.all([
      updateSource.mutateAsync({
        id,
        data: updateData,
      }),
      putSourceIgnoreLists.mutateAsync({
        id,
        data: values.ignoreLists.map((i) => i.id),
      }),
      putSourceSecrets.mutateAsync({
        id,
        data: values.sourceSecrets,
      }),
    ]);
    toast.success("Source saved");
    navigate({ to: "/sources/$id", params: { id } });
  };

  const onDelete = async () => {
    await deleteSource.mutateAsync(id);
    toast.success("Source deleted", {
      description: `Source ${source.data.name} was deleted successfully.`,
    });
    navigate({ to: "/sources" });
  };

  return (
    <SourceEditCreate
      source={source.data}
      ignoreLists={sourceIgnoreLists.data}
      sourceSecrets={sourceSecrets.data}
      onDelete={onDelete}
      onSubmit={onSubmit}
    />
  );
};

export const Route = createFileRoute("/sources/$id/edit")({
  component: SourceEditComponent,
  loader: async ({ context: { queryClient }, params: { id } }) => {
    await Promise.all([
      queryClient.ensureQueryData(sourceQueryOptions(id)),
      queryClient.ensureQueryData(sourceIgnoreListsQueryOptions(id)),
      queryClient.ensureQueryData(sourceSecretsQueryOptions(id)),
    ]);
  },
});

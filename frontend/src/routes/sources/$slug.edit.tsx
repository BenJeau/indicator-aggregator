import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { Forms, Trans } from "@/components";
import {
  sourceIgnoreListsQueryOptions,
  sourceQueryOptions,
  sourceSecretsQueryOptions,
  sourceSlugQueryOptions,
  useDeleteSourceMutation,
  usePutSourceIgnoreListMutation,
  usePutSourceSecretsMutation,
  useUpdateSourceMutation,
} from "@/api/sources";
import { SourceKind } from "@/types/backendTypes";
import { beforeLoadAuthenticated } from "@/auth";

const SourceEditComponent: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = Route.useParams();

  const { data: id } = useSuspenseQuery(sourceSlugQueryOptions(slug));
  const source = useSuspenseQuery(sourceQueryOptions(id));
  const sourceIgnoreLists = useSuspenseQuery(sourceIgnoreListsQueryOptions(id));
  const sourceSecrets = useSuspenseQuery(sourceSecretsQueryOptions(id));

  const deleteSource = useDeleteSourceMutation();
  const updateSource = useUpdateSourceMutation();
  const putSourceIgnoreLists = usePutSourceIgnoreListMutation();
  const putSourceSecrets = usePutSourceSecretsMutation();

  const onSubmit = async (values: Forms.SourceEditCreate.FormSchema) => {
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
    toast.success(<Trans id="source.saved" />);
    navigate({ to: "/sources/$slug", params: { slug } });
  };

  const onDelete = async () => {
    await deleteSource.mutateAsync(id);
    toast.success(<Trans id="source.deleted.title" />, {
      description: (
        <Trans id="source.deleted.description" name={source.data.name} />
      ),
    });
    navigate({ to: "/sources" });
  };

  return (
    <Forms.SourceEditCreate.default
      source={source.data}
      ignoreLists={sourceIgnoreLists.data}
      sourceSecrets={sourceSecrets.data}
      onDelete={onDelete}
      onSubmit={onSubmit}
    />
  );
};

export const Route = createFileRoute("/sources/$slug/edit")({
  component: SourceEditComponent,
  beforeLoad: beforeLoadAuthenticated(),
  loader: async ({ context: { queryClient }, params: { slug } }) => {
    const id = await queryClient.ensureQueryData(sourceSlugQueryOptions(slug));

    if (!id) {
      return;
    }

    await Promise.all([
      queryClient.ensureQueryData(sourceQueryOptions(id)),
      queryClient.ensureQueryData(sourceIgnoreListsQueryOptions(id)),
      queryClient.ensureQueryData(sourceSecretsQueryOptions(id)),
    ]);
  },
});

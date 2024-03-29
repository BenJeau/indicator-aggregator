import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  UseSuspenseQueryResult,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { toast } from "sonner";

import {
  FormSchema,
  ProviderEditCreate,
} from "@/components/provider-edit-create";
import {
  providerIgnoreListsQueryOptions,
  providerQueryOptions,
  providerSourcesQueryOptions,
  useProviderDelete,
  useProviderPatch,
  usePutProviderIgnoreListsMutation,
  usePutProviderSourcesMutation,
} from "@/api/providers";
import { ProviderWithNumSources } from "@/types/backendTypes";

const ProviderEditComponent: React.FC = () => {
  const navigate = useNavigate();
  const { id } = Route.useParams();

  const provider = useSuspenseQuery(
    providerQueryOptions(id),
  ) as UseSuspenseQueryResult<ProviderWithNumSources, Error>;
  const providerIgnoreLists = useSuspenseQuery(
    providerIgnoreListsQueryOptions(id),
  );
  const providerSources = useSuspenseQuery(providerSourcesQueryOptions(id));

  const deleteProvider = useProviderDelete();
  const patchProvider = useProviderPatch();
  const putProviderIgnoreLists = usePutProviderIgnoreListsMutation();
  const putProviderSources = usePutProviderSourcesMutation();

  const onSubmit = async (values: FormSchema) => {
    await Promise.all([
      patchProvider.mutateAsync({
        id: provider.data.id,
        data: {
          name: values.name,
          description: values.description,
          url: values.url,
          favicon: values.favicon,
          tags: values.tags,
          enabled: values.enabled,
        },
      }),
      putProviderIgnoreLists.mutateAsync({
        id: provider.data.id,
        data: values.ignoreLists.map((i) => i.id),
      }),
      putProviderSources.mutateAsync({
        id: provider.data.id,
        data: values.sources.map((i) => i.id),
      }),
    ]);
    toast.success("Provider saved");
    navigate({ to: "/providers/$id", params: { id } });
  };

  const onDelete = async () => {
    await deleteProvider.mutateAsync(provider.data.id);
    toast.success("Provider deleted", {
      description: `Provider ${provider.data.name} was deleted successfully and is no longer linked to any sources.`,
    });
    navigate({ to: "/providers" });
  };

  return (
    <ProviderEditCreate
      provider={provider.data}
      sources={providerSources.data}
      ignoreLists={providerIgnoreLists.data}
      onDelete={onDelete}
      onSubmit={onSubmit}
    />
  );
};

export const Route = createFileRoute("/providers/$id/edit")({
  component: ProviderEditComponent,
  loader: async ({ context: { queryClient }, params: { id } }) => {
    await Promise.all([
      queryClient.ensureQueryData(providerQueryOptions(id)),
      queryClient.ensureQueryData(providerSourcesQueryOptions(id)),
      queryClient.ensureQueryData(providerIgnoreListsQueryOptions(id)),
    ]);
  },
});

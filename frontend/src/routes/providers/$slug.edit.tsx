import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  UseSuspenseQueryResult,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { Forms } from "@/components";
import {
  providerIgnoreListsQueryOptions,
  providerQueryOptions,
  providerSlugQueryOptions,
  providerSourcesQueryOptions,
  useProviderDelete,
  useProviderPatch,
  usePutProviderIgnoreListsMutation,
  usePutProviderSourcesMutation,
} from "@/api/providers";
import { Provider } from "@/types/backendTypes";

const ProviderEditComponent: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = Route.useParams();

  const { data: id } = useSuspenseQuery(providerSlugQueryOptions(slug));
  const provider = useSuspenseQuery(
    providerQueryOptions(id),
  ) as UseSuspenseQueryResult<Provider, Error>;
  const providerIgnoreLists = useSuspenseQuery(
    providerIgnoreListsQueryOptions(id),
  );
  const providerSources = useSuspenseQuery(providerSourcesQueryOptions(id));

  const deleteProvider = useProviderDelete();
  const patchProvider = useProviderPatch();
  const putProviderIgnoreLists = usePutProviderIgnoreListsMutation();
  const putProviderSources = usePutProviderSourcesMutation();

  const onSubmit = async (values: Forms.ProviderEditCreate.FormSchema) => {
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
    navigate({ to: "/providers/$slug", params: { slug } });
  };

  const onDelete = async () => {
    await deleteProvider.mutateAsync(provider.data.id);
    toast.success("Provider deleted", {
      description: `Provider ${provider.data.name} was deleted successfully and is no longer linked to any sources.`,
    });
    navigate({ to: "/providers" });
  };

  return (
    <Forms.ProviderEditCreate.default
      provider={provider.data}
      sources={providerSources.data}
      ignoreLists={providerIgnoreLists.data}
      onDelete={onDelete}
      onSubmit={onSubmit}
    />
  );
};

export const Route = createFileRoute("/providers/$slug/edit")({
  component: ProviderEditComponent,
  loader: async ({ context: { queryClient }, params: { slug } }) => {
    const id = await queryClient.ensureQueryData(
      providerSlugQueryOptions(slug),
    );

    if (!id) {
      return;
    }

    await Promise.all([
      queryClient.ensureQueryData(providerQueryOptions(id)),
      queryClient.ensureQueryData(providerSourcesQueryOptions(id)),
      queryClient.ensureQueryData(providerIgnoreListsQueryOptions(id)),
    ]);
  },
});

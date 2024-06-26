import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  UseSuspenseQueryResult,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { Forms, Trans } from "@/components";
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
import { beforeLoadAuthenticated } from "@/lib/auth";

const ProviderEditComponent: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = Route.useParams();

  const { data: id } = useSuspenseQuery(providerSlugQueryOptions(slug));
  const provider = useSuspenseQuery(
    providerQueryOptions(id),
  ) as UseSuspenseQueryResult<Provider>;
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
    toast.success(<Trans id="provider.saved" />);
    await navigate({ to: "/providers/$slug", params: { slug } });
  };

  const onDelete = async () => {
    await deleteProvider.mutateAsync(provider.data.id);
    toast.success(<Trans id="provider.deleted.title" />, {
      description: (
        <Trans id="provider.deleted.description" name={provider.data.name} />
      ),
    });
    await navigate({ to: "/providers" });
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
  beforeLoad: beforeLoadAuthenticated(),
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

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useSuspenseQuery } from "@tanstack/react-query";

import { Forms, Trans } from "@/components";
import {
  ignoreListQueryOptions,
  ignoreListEntriesQueryOptions,
  ignoreListSourcesQueryOptions,
  ignoreListProvidersQueryOptions,
  useIgnoreListDelete,
  useIgnoreListPatch,
  useIgnoreListProvidersPut,
  useIgnoreListSourcesPut,
  useIgnoreListEntryPut,
  ignoreListSlugQueryOptions,
} from "@/api/ignoreLists";
import { beforeLoadAuthenticated } from "@/lib/auth";

const ListEditComponent: React.FC = () => {
  const { slug } = Route.useParams();

  const navigate = useNavigate();

  const { data: id } = useSuspenseQuery(ignoreListSlugQueryOptions(slug));
  const ignoreList = useSuspenseQuery(ignoreListQueryOptions(id));
  const ignoreListEntries = useSuspenseQuery(ignoreListEntriesQueryOptions(id));
  const ignoreListSources = useSuspenseQuery(ignoreListSourcesQueryOptions(id));
  const ignoreListProviders = useSuspenseQuery(
    ignoreListProvidersQueryOptions(id),
  );

  const patchIgnoreList = useIgnoreListPatch();
  const deleteIgnoreList = useIgnoreListDelete();
  const putIgnoreListProviders = useIgnoreListProvidersPut();
  const putIgnoreListSources = useIgnoreListSourcesPut();
  const putIgnoreListEntries = useIgnoreListEntryPut();

  const onSubmit = async (values: Forms.ListEditCreate.FormSchema) => {
    await Promise.all([
      patchIgnoreList.mutateAsync({
        id,
        data: {
          name: values.name,
          description: values.description,
          enabled: values.enabled,
          global: values.global,
        },
      }),
      putIgnoreListProviders.mutateAsync({
        listId: id,
        data: values.providers.map((i) => i.id),
      }),
      putIgnoreListSources.mutateAsync({
        listId: id,
        data: values.sources.map((i) => i.id),
      }),
      putIgnoreListEntries.mutateAsync({
        listId: id,
        data: values.entries.map(({ data, indicatorKind }) => ({
          data,
          indicatorKind,
        })),
      }),
    ]);
    toast.success(<Trans id="ignore.list.saved" />);
    await navigate({ to: "/lists/$slug", params: { slug } });
  };

  const onDelete = async () => {
    await deleteIgnoreList.mutateAsync(id);
    toast.success(<Trans id="ignore.list.deleted.title" />, {
      description: (
        <Trans
          id="ignore.list.deleted.description"
          name={ignoreList.data.name}
        />
      ),
    });
    await navigate({ to: "/lists" });
  };

  return (
    <Forms.ListEditCreate.default
      list={ignoreList.data}
      sources={ignoreListSources.data}
      providers={ignoreListProviders.data}
      entries={ignoreListEntries.data}
      onSubmit={onSubmit}
      onDelete={onDelete}
    />
  );
};

export const Route = createFileRoute("/lists/$slug/edit")({
  component: ListEditComponent,
  beforeLoad: beforeLoadAuthenticated(),
  loader: async ({ context: { queryClient }, params: { slug } }) => {
    const id = await queryClient.ensureQueryData(
      ignoreListSlugQueryOptions(slug),
    );

    if (!id) {
      return;
    }

    await Promise.all([
      queryClient.ensureQueryData(ignoreListQueryOptions(id)),
      queryClient.ensureQueryData(ignoreListEntriesQueryOptions(id)),
      queryClient.ensureQueryData(ignoreListSourcesQueryOptions(id)),
      queryClient.ensureQueryData(ignoreListProvidersQueryOptions(id)),
    ]);
  },
});

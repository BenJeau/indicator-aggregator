import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { Forms } from "@/components";
import {
  useIgnoreListCreate,
  useIgnoreListProvidersPut,
  useIgnoreListSourcesPut,
  useIgnoreListEntryPut,
} from "@/api/ignoreLists";

const ListsNewComponent: React.FC = () => {
  const navigate = useNavigate();
  const search = Route.useSearch();

  const ignoreListCreate = useIgnoreListCreate();
  const putIgnoreListProviders = useIgnoreListProvidersPut();
  const putIgnoreListSources = useIgnoreListSourcesPut();
  const putIgnoreListEntries = useIgnoreListEntryPut();

  const onSubmit = async (values: Forms.ListEditCreate.FormSchema) => {
    const { id, slug } = await ignoreListCreate.mutateAsync(values);
    await Promise.all([
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
    toast.success("Ignore list created");
    navigate({ to: `/lists/$slug`, params: { slug } });
  };

  return (
    <Forms.ListEditCreate.default onSubmit={onSubmit} name={search.name} />
  );
};

type IgnoreListSearch = {
  name?: string;
};

export const Route = createFileRoute("/lists/new")({
  component: ListsNewComponent,
  validateSearch: (search: Record<string, unknown>): IgnoreListSearch => {
    return {
      name: search.name as string,
    };
  },
});

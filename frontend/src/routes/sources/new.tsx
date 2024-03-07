import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { SourceEditCreate, FormSchema } from "@/components/source-edit-create";
import {
  useCreateSourceMutation,
  usePutSourceIgnoreListMutation,
  usePutSourceSecretsMutation,
} from "@/api/sources";
import { SourceKind } from "@/types/backendTypes";

const SourceNewComponent: React.FC = () => {
  const navigate = useNavigate();
  const search = Route.useSearch();

  const createSource = useCreateSourceMutation();
  const createSourceIgnoreList = usePutSourceIgnoreListMutation();
  const createSourceSecrets = usePutSourceSecretsMutation();

  const onSubmit = async (values: FormSchema) => {
    const id = await createSource.mutateAsync({
      ...values,
      kind: values.kind as SourceKind,
      config: [],
      configValues: [],
    });

    await Promise.all([
      createSourceIgnoreList.mutateAsync({
        id,
        data: values.ignoreLists.map((i) => i.id),
      }),
      createSourceSecrets.mutateAsync({
        id,
        data: values.sourceSecrets,
      }),
    ]);

    toast.success("Source created");
    navigate({ to: `/sources/$id`, params: { id } });
  };

  return <SourceEditCreate onSubmit={onSubmit} name={search.name} />;
};

type SourceSearch = {
  name?: string;
};

export const Route = createFileRoute("/sources/new")({
  component: SourceNewComponent,
  validateSearch: (search: SourceSearch): SourceSearch => search,
});

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { Forms, Trans } from "@/components";
import {
  useCreateSourceMutation,
  usePutSourceIgnoreListMutation,
  usePutSourceSecretsMutation,
} from "@/api/sources";
import { SourceKind } from "@/types/backendTypes";
import { beforeLoadAuthenticated } from "@/lib/auth";

const SourceNewComponent: React.FC = () => {
  const navigate = useNavigate();
  const search = Route.useSearch();

  const createSource = useCreateSourceMutation();
  const createSourceIgnoreList = usePutSourceIgnoreListMutation();
  const createSourceSecrets = usePutSourceSecretsMutation();

  const onSubmit = async (values: Forms.SourceEditCreate.FormSchema) => {
    const { id, slug } = await createSource.mutateAsync({
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

    toast.success(<Trans id="source.created" />);
    navigate({ to: `/sources/$slug`, params: { slug } });
  };

  return (
    <Forms.SourceEditCreate.default onSubmit={onSubmit} name={search.name} />
  );
};

type SourceSearch = {
  name?: string;
};

export const Route = createFileRoute("/sources/new")({
  component: SourceNewComponent,
  beforeLoad: beforeLoadAuthenticated(),
  validateSearch: (search: SourceSearch): SourceSearch => search,
});

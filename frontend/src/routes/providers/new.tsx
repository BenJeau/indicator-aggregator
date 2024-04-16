import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import {
  FormSchema,
  ProviderEditCreate,
} from "@/components/provider-edit-create";
import { useProviderCreate } from "@/api/providers";

const ProvidersNewComponent: React.FC = () => {
  const navigate = useNavigate();
  const providerCreate = useProviderCreate();
  const search = Route.useSearch();

  const onSubmit = async (values: FormSchema) => {
    const { slug } = await providerCreate.mutateAsync(values);
    toast.success("Provider created");
    navigate({ to: `/providers/$slug`, params: { slug } });
  };

  return <ProviderEditCreate onSubmit={onSubmit} name={search.name} />;
};

type ProviderSearch = {
  name?: string;
};

export const Route = createFileRoute("/providers/new")({
  component: ProvidersNewComponent,
  validateSearch: (search: Record<string, unknown>): ProviderSearch => {
    return {
      name: search.name as string,
    };
  },
});

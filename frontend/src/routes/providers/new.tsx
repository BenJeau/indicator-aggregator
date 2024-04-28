import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { Forms } from "@/components";
import { useProviderCreate } from "@/api/providers";

const ProvidersNewComponent: React.FC = () => {
  const navigate = useNavigate();
  const providerCreate = useProviderCreate();
  const search = Route.useSearch();

  const onSubmit = async (values: Forms.ProviderEditCreate.FormSchema) => {
    const { slug } = await providerCreate.mutateAsync(values);
    toast.success("Provider created");
    navigate({ to: `/providers/$slug`, params: { slug } });
  };

  return (
    <Forms.ProviderEditCreate.default onSubmit={onSubmit} name={search.name} />
  );
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

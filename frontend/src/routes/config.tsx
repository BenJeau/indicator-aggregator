import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";

import { secretsQueryOptions } from "@/api/secrets";
import { configQueryOptions } from "@/api/config";
import { Separator } from "@/components/ui/separator";
import { SecretsTable, GeneralServerConfig, Trans } from "@/components";
import { beforeLoadAuthenticated } from "@/auth";
import { useCreateApiTokenMutation } from "@/api/apiTokens";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const ConfigComponent: React.FC = () => {
  const secrets = useSuspenseQuery(secretsQueryOptions);
  const config = useSuspenseQuery(configQueryOptions);

  const [showForm, setShowForm] = useState(false);

  return (
    <div className="flex flex-col gap-2 p-4">
      <CreateApiTokenForm />
      <SecretsTable
        secrets={secrets.data}
        showForm={showForm}
        setShowForm={setShowForm}
      />
      <Separator className="mt-4" />
      <GeneralServerConfig config={config.data} />
    </div>
  );
};

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Save } from "lucide-react";

const formSchema = z.object({
  note: z.string(),
  expiresAt: z.optional(z.date()),
});

export type FormSchema = z.infer<typeof formSchema>;

const CreateApiTokenForm: React.FC = () => {
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: { note: "", expiresAt: undefined },
  });

  const createApiToken = useCreateApiTokenMutation();

  const onSubmit = async (values: FormSchema) => {
    const token = await createApiToken.mutateAsync({
      note: values.note,
      expiresAt: values.expiresAt ? values.expiresAt.toISOString() : undefined,
    });

    toast("Created API token", {
      description: token.value,
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex h-full flex-col"
      >
        <FormField
          control={form.control}
          name="note"
          render={({ field }) => (
            <FormItem className="text-sm">
              <FormLabel className="text-xs">Note</FormLabel>
              <FormControl>
                <Input className="h-8" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="gap-2" size="sm" type="submit">
          <Save size={16} />
          <Trans id="save" />
        </Button>
      </form>
    </Form>
  );
};

export const Route = createFileRoute("/config")({
  component: ConfigComponent,
  beforeLoad: beforeLoadAuthenticated(),
  loader: async ({ context: { queryClient } }) =>
    await Promise.all([
      queryClient.ensureQueryData(secretsQueryOptions),
      queryClient.ensureQueryData(configQueryOptions),
    ]),
});

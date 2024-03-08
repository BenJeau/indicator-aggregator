import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { SendHorizonal, Trash } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ModifiedRequest, useRequest } from "@/api/requests";
import { IndicatorKind } from "@/types/backendTypes";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Form,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { detectIndicatorKind } from "@/validation";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { sourcesQueryOptions } from "@/api/sources";
import RequestDataView from "@/components/request-data-view";

const formSchema = z.object({
  indicator: z.string().min(2).max(100),
  indicatorKind: z.nativeEnum(IndicatorKind),
  autoDetectKind: z.boolean(),
  sources: z.array(
    z.object({
      id: z.string().uuid(),
      name: z.string(),
    }),
  ),
});

export type FormSchema = z.infer<typeof formSchema>;

const RequestComponent: React.FC = () => {
  const search = Route.useSearch();
  const navigate = useNavigate();

  const sources = useSuspenseQuery(sourcesQueryOptions);
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      indicator: "",
      indicatorKind: undefined,
      autoDetectKind: false,
      sources: [],
    },
  });

  const [mutationData, setMutationData] = useState<ModifiedRequest | undefined>(
    undefined,
  );

  const request = useRequest(mutationData);

  const onSubmit = (values: FormSchema) => {
    navigate({
      to: "/request",
      search: {
        data: values.indicator,
        kind: values.autoDetectKind
          ? detectIndicatorKind(values.indicator)
          : values.indicatorKind,
        sources: values.sources.map(({ id }) => id),
      },
    });
  };

  useEffect(() => {
    if (search.requestId && !mutationData) {
      navigate({
        to: "/history/$id",
        params: { id: search.requestId },
      });
      return;
    }

    if (search.kind !== undefined && search.kind in IndicatorKind) {
      form.setValue("indicatorKind", search.kind as IndicatorKind);
    } else {
      form.resetField("indicatorKind");
    }

    if (search.data && search.kind) {
      const sourcesWithNames = (search.sources
        ?.map((id) => ({
          id,
          name: sources.data.find(({ id: sourceId }) => sourceId === id)?.name,
        }))
        .filter((source) => source.name !== undefined) ?? []) as {
        id: string;
        name: string;
      }[];

      form.setValue("indicator", search.data);
      form.setValue("sources", sourcesWithNames);

      if (search.kind in IndicatorKind) {
        form.setValue("indicatorKind", search.kind as IndicatorKind);
      }

      setMutationData({
        data: search.data,
        kind: search.kind as IndicatorKind,
        sources: sourcesWithNames,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, request.data]);

  useEffect(() => {
    if (request.data?.requestId) {
      navigate({
        to: "/request",
        replace: true,
        search: {
          ...search,
          requestId: request.data.requestId,
        },
      });
    }
  }, [request.data?.requestId, navigate, search]);

  const canSubmit = !request.isFetching;

  return (
    <div className="relative flex flex-1 flex-col">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="bg-background/50 sticky top-0 z-10 p-4 pb-0 backdrop-blur-md"
        >
          <div className="top-0 flex flex-col gap-4 md:flex-row">
            <div className="flex flex-1 flex-wrap gap-4">
              <FormField
                control={form.control}
                name="indicator"
                render={({ field }) => (
                  <FormItem className="min-w-40 flex-1 text-sm">
                    <FormLabel className="text-xs">Value</FormLabel>
                    <FormControl>
                      <Input
                        className="h-8 bg-white dark:bg-black"
                        placeholder="e.g. https://abuse.ch"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sources"
                render={({ field }) => {
                  const availableSources =
                    sources.data?.filter(
                      ({ id }) =>
                        !field.value.some((source) => source.id === id),
                    ) || [];

                  return (
                    <FormItem className="flex-1 text-sm">
                      <FormLabel className="text-xs">Sources</FormLabel>
                      <FormControl>
                        <div className="flex flex-col gap-2">
                          <Select
                            onValueChange={(name) => {
                              const id = sources.data?.find(
                                ({ name: sourceName }) => sourceName === name,
                              )?.id;
                              field.onChange([...field.value, { id, name }]);
                            }}
                            value=""
                            disabled={availableSources.length === 0}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a source" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableSources.map((source) => (
                                <SelectItem key={source.id} value={source.name}>
                                  {source.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <div className="flex flex-wrap gap-2">
                            {field.value.map(({ id, name }) => (
                              <Badge
                                key={id}
                                variant="secondary"
                                className="gap-2"
                              >
                                <button
                                  onClick={() => {
                                    field.onChange(
                                      field.value.filter(
                                        (value) => value.id !== id,
                                      ),
                                    );
                                  }}
                                  type="button"
                                >
                                  <Trash size={12} strokeWidth={2.5} />
                                </button>
                                {name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <div className="flex min-w-40 flex-1 flex-col gap-2 sm:min-w-60 sm:flex-grow-0">
                <FormField
                  control={form.control}
                  name="indicatorKind"
                  render={({ field }) => (
                    <FormItem className="text-sm">
                      <FormLabel className="text-xs">Kind</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={form.getValues("autoDetectKind")}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select kind" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(IndicatorKind).map(
                              ([key, value]) => (
                                <SelectItem key={value} value={value}>
                                  {key}
                                </SelectItem>
                              ),
                            )}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="autoDetectKind"
                  render={({ field }) => (
                    <FormItem className="text-sm">
                      <FormControl>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            ref={field.ref}
                            id={field.name}
                            onBlur={field.onBlur}
                            name={field.name}
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <Label htmlFor={field.name} className="text-xs">
                            Automatically detect indicator kind
                          </Label>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <Button
              type="submit"
              variant={canSubmit ? "success" : "ghost"}
              disabled={!canSubmit}
              className="h-auto gap-4 rounded-2xl px-6 text-lg font-semibold"
            >
              Submit
              <SendHorizonal size={20} strokeWidth={2.5} />
            </Button>
          </div>
          <Separator className="mt-4" />
        </form>
      </Form>
      <RequestDataView
        data={request.data?.data}
        isFetching={request.isFetching}
      />
    </div>
  );
};

type IndicatorRequest = {
  data?: string;
  kind?: string;
  sources?: string[];
  requestId?: string;
};

export const Route = createFileRoute("/request")({
  component: RequestComponent,
  validateSearch: (search: IndicatorRequest): IndicatorRequest => search,
  loader: async ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(sourcesQueryOptions),
});

import { Trash, SendHorizonal } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { forwardRef, useEffect, useImperativeHandle } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { indicatorKindIconMapping, indicatorKindMapping } from "@/data";
import { IndicatorKind, Source } from "@/types/backendTypes";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Form,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { detectIndicatorKind } from "@/validation";
import { useNavigate } from "@tanstack/react-router";

interface Props {
  sources?: Source[];
  canSubmit?: boolean;
}

const formSchema = z.object({
  indicator: z.string().min(2).max(100),
  indicatorKind: z.nativeEnum(IndicatorKind),
  autoDetectKind: z.boolean(),
  sources: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
    }),
  ),
});

export type FormSchema = z.infer<typeof formSchema>;

export interface RequestFormRef {
  form: ReturnType<typeof useForm<FormSchema>> | null;
}

const RequestForm = forwardRef<RequestFormRef, Props>(
  ({ sources = [], canSubmit = true }, ref) => {
    const navigate = useNavigate();

    const form = useForm<FormSchema>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        indicator: "",
        indicatorKind: undefined,
        autoDetectKind: true,
        sources: [],
      },
    });

    useImperativeHandle(ref, () => ({
      form,
    }));

    useEffect(() => {
      const subscription = form.watch((value, { name }) => {
        if (name === "indicator" && value.autoDetectKind && value.indicator) {
          const indicatorKindDetected = detectIndicatorKind(value.indicator);

          if (indicatorKindDetected) {
            form.setValue("indicatorKind", indicatorKindDetected);
          }
        }
      });
      return () => subscription.unsubscribe();
    }, [form]);

    const onSubmit = (values: FormSchema) => {
      navigate({
        to: "/request",
        search: {
          data: values.indicator,
          kind: values.indicatorKind,
          sources: values.sources.map(({ id }) => id),
        },
      });
    };

    return (
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
                        className="h-8"
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
                    sources.filter(
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
                              const id = sources.find(
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
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select kind" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.values(IndicatorKind).map((value) => {
                              const Icon = indicatorKindIconMapping[value];
                              return (
                                <SelectItem key={value} value={value}>
                                  <div className="flex gap-2 items-center">
                                    <Icon size={14} />
                                    {indicatorKindMapping[value]}
                                  </div>
                                </SelectItem>
                              );
                            })}
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
    );
  },
);

export default RequestForm;

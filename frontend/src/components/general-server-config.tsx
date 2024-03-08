import { CalendarClock, Eraser, Hash, Save, Undo } from "lucide-react";
import dayjs from "dayjs";
import { useMemo } from "react";
import { UseFormReturn, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ServerConfig,
  ServerConfigKind,
  SourceKind,
} from "@/types/backendTypes";
import { Editor } from "@/components/editor";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useConfigUpdate } from "@/api/config";

interface Props {
  config: ServerConfig[];
}

const formSchema = z.object({
  config: z.array(
    z.object({
      id: z.string(),
      value: z.coerce.string().optional(),
    }),
  ),
});

export type FormSchema = z.infer<typeof formSchema>;

const GeneralServerConfig: React.FC<Props> = ({ config }) => {
  const groupedConfig = useMemo(() => {
    return config.reduce(
      (acc, curr, index) => {
        if (!acc[curr.category]) {
          acc[curr.category] = [];
        }
        acc[curr.category].push({ data: curr, index });
        return acc;
      },
      {} as { [key: string]: { data: ServerConfig; index: number }[] },
    );
  }, [config]);

  const configMutate = useConfigUpdate();

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      config: config.map((i) => ({
        id: i.id,
        value: i.value ?? i.defaultValue,
      })),
    },
  });

  const handleOnSubmit = async (values: FormSchema) => {
    const changedValues = values.config
      .filter((value) => {
        const originalValue =
          config.find((i) => i.id === value.id)?.value ?? "";
        return originalValue !== value.value;
      })
      .map((value) => ({
        id: value.id,
        description: config.find((i) => i.id === value.id)?.description ?? "",
        value: value.value,
      }));

    await configMutate.mutateAsync(changedValues);
    toast.success("Config updated");

    form.reset(values);
  };

  const isFormDirty = form.formState.isDirty;

  const allFieldsAreDefaultValues = form.watch("config").every((i) => {
    const originalValue = config.find((j) => j.id === i.id)?.defaultValue ?? "";
    return originalValue === i.value;
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleOnSubmit)}
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col gap-4 mt-2">
          {Object.entries(groupedConfig).map(([category, data]) => (
            <div className="flex flex-col gap-2">
              <h2 className="text-lg font-semibold">{category}</h2>
              <div
                className={`grid gap-4 ${numberToGridCols[calulcatorOfCols(data.map((i) => i.data))]}`}
              >
                {data.map(({ data, index }) => (
                  <ConfigEntry
                    key={data.id}
                    index={index}
                    config={data}
                    form={form}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2 justify-between">
          <div className="flex gap-2">
            <Button
              variant="destructive"
              className="gap-2"
              disabled={allFieldsAreDefaultValues}
              type="button"
              onClick={() => {
                form.setValue(
                  "config",
                  config.map((i) => ({
                    id: i.id,
                    value: i.defaultValue,
                  })),
                  { shouldDirty: true },
                );
              }}
            >
              <Eraser size={16} /> Reset all to defaults
            </Button>
            <Button
              variant="secondary"
              className="gap-2"
              disabled={!isFormDirty}
              type="button"
              onClick={() => form.reset()}
            >
              <Undo size={16} /> Undo changes
            </Button>
          </div>
          <Button variant="success" className="gap-2" disabled={!isFormDirty}>
            <Save size={16} /> Save changes
          </Button>
        </div>
      </form>
    </Form>
  );
};

const numberToColSpan = {
  2: "lg:col-span-2",
  3: "lg:col-span-3",
  6: "lg:col-span-6",
};

const numberToGridCols = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
  7: "grid-cols-7",
  8: "grid-cols-8",
  9: "grid-cols-9",
  10: "grid-cols-10",
  11: "grid-cols-11",
  12: "grid-cols-12",
};

const calulcatorOfCols = (
  data: ServerConfig[],
): keyof typeof numberToGridCols => {
  const colCount = data.reduce((acc, curr) => {
    return acc + configGridColMapping[curr.kind];
  }, 0);
  return Math.min(12, colCount) as keyof typeof numberToGridCols;
};

const configGridColMapping: {
  [key in ServerConfigKind]: keyof typeof numberToColSpan;
} = {
  [ServerConfigKind.Boolean]: 2,
  [ServerConfigKind.Code]: 6,
  [ServerConfigKind.Number]: 3,
  [ServerConfigKind.String]: 3,
};

const ConfigEntry: React.FC<{
  config: ServerConfig;
  form: UseFormReturn<FormSchema>;
  index: number;
}> = ({
  config: { friendlyName, updatedAt, description, defaultValue, kind, key },
  form,
  index,
}) => {
  return (
    <FormField
      control={form.control}
      name={`config.${index}.value`}
      render={({ field }) => (
        <FormItem
          className={`col-span-12 ${numberToColSpan[configGridColMapping[kind]]}`}
        >
          <div className="flex justify-between items-center">
            <div className="text-md gap-4 flex">
              {friendlyName}
              <Tooltip>
                <TooltipTrigger>
                  <CalendarClock
                    size={14}
                    className="opacity-50 hover:opacity-100 transition-opacity"
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <div>
                    <strong>Last Updated</strong>
                  </div>
                  {dayjs.utc(updatedAt).local().format("LLL")}
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger>
                  <Hash
                    size={14}
                    className="opacity-50 hover:opacity-100 transition-opacity"
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <div>
                    <strong>Config Key</strong>
                  </div>
                  <code>{key}</code>
                </TooltipContent>
              </Tooltip>
            </div>
            {field.value !== defaultValue && (
              <Button
                className="gap-2 h-6 "
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => {
                  field.onChange(defaultValue);
                }}
              >
                <Eraser size={16} /> Reset to default
              </Button>
            )}
          </div>
          <span className="text-xs">{description}</span>
          <FormControl>
            <div>
              {kind === ServerConfigKind.Code && (
                <Editor
                  value={field.value ?? ""}
                  sourceKind={SourceKind.Python}
                  onChange={field.onChange}
                />
              )}
              {kind === ServerConfigKind.Boolean && (
                <Checkbox
                  ref={field.ref}
                  id={field.name}
                  onBlur={field.onBlur}
                  name={field.name}
                  checked={field.value === "true" ? true : false}
                  onCheckedChange={(e) =>
                    field.onChange(e === true ? "true" : "false")
                  }
                />
              )}
              {kind === ServerConfigKind.String && (
                <Input
                  ref={field.ref}
                  value={field.value ?? ""}
                  onChange={field.onChange}
                />
              )}
              {kind === ServerConfigKind.Number && (
                <Input
                  ref={field.ref}
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  type="number"
                />
              )}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default GeneralServerConfig;

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  Check,
  Minus,
  Plus,
  Power,
  RotateCcw,
  Save,
  Trash,
  Trash2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import { IndicatorKind, Source, SourceKind } from "@/types/backendTypes";
import { SectionPanelHeader, Editor, Trans } from "@/components";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge, BadgeProps } from "@/components/ui/badge";
import { ignoreListsQueryOptions } from "@/api/ignoreLists";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { providersQueryOptions } from "@/api/providers";
import { sourceKindIconMapping } from "@/lib/data";
import { secretsQueryOptions } from "@/api/secrets";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { cleanConfigValue, configQueryOptions } from "@/api/config";
import { useTranslation } from "@/i18n";

const formSchema = z.object({
  name: z.string().min(2).max(50),
  description: z.string().max(500),
  url: z.string().url(),
  favicon: z
    .string()
    .nullish()
    .transform((x) => x ?? undefined),
  tags: z.array(z.string()),
  enabled: z.boolean(),
  supportedIndicators: z.array(z.string()),
  disabledIndicators: z.array(z.string()),
  taskEnabled: z.boolean(),
  taskInterval: z.coerce
    .number()
    .nullish()
    .transform((x) => x ?? undefined),
  limitEnabled: z.boolean(),
  limitCount: z.coerce
    .number()
    .nullish()
    .transform((x) => x ?? undefined),
  limitInterval: z.coerce
    .number()
    .nullish()
    .transform((x) => x ?? undefined),
  cacheEnabled: z.boolean(),
  cacheInterval: z.coerce
    .number()
    .nullish()
    .transform((x) => x ?? undefined),
  providerId: z.coerce
    .string()
    .nullish()
    .transform((x) => x ?? undefined),
  kind: z.string(),
  sourceCode: z.coerce
    .string()
    .nullish()
    .transform((x) => x ?? undefined),
  ignoreLists: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
    }),
  ),
  sourceSecrets: z.array(
    z.object({
      secretId: z.coerce
        .string()
        .nullish()
        .transform((x) => x ?? undefined),
      name: z.string(),
      description: z.coerce
        .string()
        .nullish()
        .transform((x) => x ?? undefined),
      required: z.boolean(),
    }),
  ),
});

export type FormSchema = z.infer<typeof formSchema>;

interface ExtraSourceProps {
  source: Source;
  ignoreLists: {
    id: string;
    name: string;
  }[];
  sourceSecrets?: {
    secretId?: string;
    name: string;
    description?: string;
    required: boolean;
  }[];
  onDelete: () => Promise<void>;
  name?: undefined;
}

interface WithoutSourceProps {
  source?: undefined;
  ignoreLists?: undefined;
  sourceSecrets?: undefined;
  onDelete?: undefined;
  name?: string;
}

type Props = {
  onSubmit: SubmitHandler<FormSchema>;
} & (ExtraSourceProps | WithoutSourceProps);

const SourceEditCreate: React.FC<Props> = ({
  source,
  ignoreLists = [],
  sourceSecrets = [],
  onSubmit,
  onDelete,
  ...props
}) => {
  const defaultValues = useCallback(
    () => ({
      name: props.name ?? "",
      description: "",
      url: "",
      favicon: undefined,
      tags: [],
      enabled: true,
      supportedIndicators: [],
      disabledIndicators: [],
      taskEnabled: false,
      taskInternal: undefined,
      limitEnabled: false,
      limitCount: undefined,
      limitInternal: undefined,
      cacheEnabled: false,
      cacheInterval: undefined,
      providerId: undefined,
      kind: "PYTHON",
      ignoreLists,
      sourceSecrets,
      ...source,
      sourceCode: cleanConfigValue(source?.sourceCode ?? ""),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [source],
  );

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues(),
  });

  useEffect(() => {
    form.reset(defaultValues());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValues]);

  const [newTag, setNewTag] = useState("");

  const sourceSecretFormFields = useFieldArray({
    control: form.control,
    name: "sourceSecrets",
  });

  const sourceIgnoreLists = useQuery(ignoreListsQueryOptions);
  const providers = useQuery(providersQueryOptions);
  const secrets = useQuery(secretsQueryOptions);
  const config = useQuery(configQueryOptions);

  const { t } = useTranslation();

  const cancelSaveDeleteSection = (
    <>
      <Link to="../">
        <Button
          variant="ghost"
          size="sm"
          type="reset"
          onClick={() => {
            form.reset();
          }}
        >
          <Trans id="cancel" />
        </Button>
      </Link>
      {source && source.kind !== SourceKind.System && (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="destructive" size="sm" className="gap-2">
              <Trash size={16} />
              <Trans id="delete" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                <Trans id="delete.confirmation.title" />
              </DialogTitle>
              <DialogDescription>
                <Trans
                  id="source.delete.confirmation.description"
                  name={<span className="font-semibold">{source.name}</span>}
                />
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogPrimitive.Close asChild>
                <Button variant="secondary">
                  <Trans id="delete" />
                </Button>
              </DialogPrimitive.Close>
              <Button
                variant="destructive"
                className="gap-2"
                onClick={onDelete}
              >
                <Trash size={16} /> <Trans id="delete" />
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      <Button className="gap-2" size="sm" type="submit">
        <Save size={16} />
        <Trans id="save" />
      </Button>
    </>
  );
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex h-full flex-col"
      >
        <SectionPanelHeader
          titleContainerClassName="items-center overflow-visible"
          titleClassName="flex-1"
          extraClassName="hidden 2xl:flex self-end"
          className="flex-col items-stretch 2xl:flex-row 2xl:items-center"
          titleIcon={
            <>
              <FormField
                control={form.control}
                name="enabled"
                render={({ field }) => (
                  <FormItem className="text-sm">
                    <FormControl>
                      <button
                        type="button"
                        className={cn(
                          "rounded-md p-2 text-white shadow",
                          field.value ? "bg-green-500" : "bg-red-500",
                        )}
                        onClick={() => {
                          field.onChange(!field.value);
                        }}
                      >
                        <Power size={16} strokeWidth={2.54} />
                      </button>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex-1 2xl:hidden" />
              <div className="flex items-center gap-2 2xl:hidden">
                {cancelSaveDeleteSection}
              </div>
            </>
          }
          title={
            <div className="flex flex-1 flex-col gap-2 2xl:flex-row">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="flex-1 text-sm">
                    <FormLabel className="text-xs">
                      <Trans id="name" />
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="h-8"
                        placeholder={t("e.g.") + " Abuse.ch"}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="flex-1 text-sm">
                    <FormLabel className="text-xs">
                      <Trans id="description" />
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="h-8"
                        placeholder={
                          t("e.g.") + " " + t("example.source.description")
                        }
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          }
          extra={cancelSaveDeleteSection}
        />
        <div className="overflow-y-scroll">
          <div className="flex flex-col gap-2 p-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem className="text-sm">
                    <FormLabel className="text-xs">
                      <Trans id="tags" />
                    </FormLabel>
                    <FormControl>
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <Input
                            className="h-8 flex-1"
                            placeholder={t("e.g.") + " threat-intelligence"}
                            value={newTag}
                            onChange={(e) => {
                              setNewTag(e.target.value);
                            }}
                          />
                          <Button
                            className="gap-2"
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              if (newTag.length > 0) {
                                field.onChange([...field.value, newTag]);
                                setNewTag("");
                              }
                            }}
                          >
                            <Plus size={16} />
                            <Trans id="add.tag" />
                          </Button>
                        </div>
                        <div className="flex gap-2">
                          {field.value.map((tag, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="gap-2"
                            >
                              <button
                                onClick={() => {
                                  field.onChange(
                                    field.value.filter((_, i) => i !== index),
                                  );
                                }}
                                type="button"
                              >
                                <Trash size={12} strokeWidth={2.5} />
                              </button>
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="kind"
                render={({ field }) => (
                  <FormItem className="flex-1 text-sm">
                    <FormLabel className="text-xs">
                      <Trans id="kind" />
                    </FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={field.value === "SYSTEM"}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(SourceKind).map(([key, value]) => {
                            const Icon = sourceKindIconMapping[value];
                            return (
                              <SelectItem
                                key={value}
                                value={value}
                                disabled={value === "SYSTEM"}
                              >
                                <div className="flex gap-2">
                                  <Icon
                                    width={14}
                                    className="dark:fill-white"
                                  />
                                  <div>{key}</div>
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
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem className="text-sm">
                    <FormLabel className="text-xs">URL</FormLabel>
                    <FormControl>
                      <Input className="h-8" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="favicon"
                render={({ field }) => (
                  <FormItem className="text-sm">
                    <FormLabel className="text-xs">
                      <Trans id="favicon" />
                    </FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <img
                          src={field.value ?? undefined}
                          alt={t("source.favicon.alt")}
                          style={{ imageRendering: "pixelated" }}
                          className={cn(
                            "h-8 w-8 rounded border shadow",
                            !field.value && "hidden",
                          )}
                        />
                        <div className="relative flex flex-1">
                          <Input
                            className="absolute bottom-0 left-0 right-0 top-0 h-8 opacity-0"
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];

                              if (file && file.size < 1024 * 1024) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  form.setValue(
                                    "favicon",
                                    reader.result?.toString(),
                                  );
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                          <Input
                            className="h-8 flex-1"
                            placeholder={t(
                              field.value ? "favicon.change" : "favicon.upload",
                            )}
                          />
                        </div>
                        <Button
                          variant="destructive"
                          type="button"
                          className={cn(
                            "h-8 w-8 p-0",
                            !field.value && "hidden",
                          )}
                          onClick={() => {
                            field.onChange("");
                          }}
                        >
                          <Trash size={16} />
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="disabledIndicators"
              render={({ field: disabledIndicatorsField }) => (
                <FormField
                  control={form.control}
                  name="supportedIndicators"
                  render={({ field: supportedIndicatorsField }) => (
                    <FormItem className="text-sm">
                      <FormLabel className="text-xs">
                        <Trans id="disabled.supported.indicator.kinds" />
                      </FormLabel>
                      <FormControl>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(IndicatorKind).map(([key, value]) => {
                            const isSupported =
                              supportedIndicatorsField.value.includes(value);
                            const isDisabled =
                              disabledIndicatorsField.value.includes(value);

                            let variant: BadgeProps["variant"] = "secondary";
                            let Icon = Minus;

                            if (isSupported) {
                              if (isDisabled) {
                                variant = "destructive";
                                Icon = X;
                              } else {
                                variant = "success";
                                Icon = Check;
                              }
                            }

                            return (
                              <Badge
                                key={key}
                                variant={variant}
                                className="cursor-pointer gap-2"
                                onClick={() => {
                                  if (isSupported && isDisabled) {
                                    supportedIndicatorsField.onChange(
                                      supportedIndicatorsField.value.filter(
                                        (i) => i !== value,
                                      ),
                                    );
                                    disabledIndicatorsField.onChange(
                                      disabledIndicatorsField.value.filter(
                                        (i) => i !== value,
                                      ),
                                    );
                                  } else if (isSupported && !isDisabled) {
                                    disabledIndicatorsField.onChange([
                                      ...disabledIndicatorsField.value,
                                      value,
                                    ]);
                                  } else {
                                    supportedIndicatorsField.onChange([
                                      ...supportedIndicatorsField.value,
                                      value,
                                    ]);
                                  }
                                }}
                              >
                                <Icon size={14} strokeWidth={3} />
                                {value}
                              </Badge>
                            );
                          })}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            />
            <div className="mt-2 grid grid-cols-4 items-center gap-4">
              <FormField
                control={form.control}
                name="limitEnabled"
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
                          <Trans id="enable.rate.limiter" />
                        </Label>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="limitCount"
                render={({ field }) => (
                  <FormItem className="col-span-2 text-sm">
                    <FormLabel className="text-xs">
                      <Trans id="max.request.per.interval" />
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={!form.getValues("limitEnabled")}
                        type="number"
                        className="h-8"
                        placeholder={t("e.g.") + " 50"}
                        min={1}
                        value={field.value?.toString() ?? undefined}
                        onChange={(e) => {
                          field.onChange(Number(e.target.value));
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="limitInterval"
                render={({ field }) => (
                  <FormItem className="text-sm">
                    <FormLabel className="text-xs">
                      <Trans id="limit.interval" />
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={!form.getValues("limitEnabled")}
                        type="number"
                        className="h-8"
                        placeholder={t("e.g.") + " 360"}
                        min={1}
                        value={field.value?.toString() ?? undefined}
                        onChange={(e) => {
                          field.onChange(Number(e.target.value));
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="mt-4 grid grid-cols-4 items-center gap-4">
              <FormField
                control={form.control}
                name="taskEnabled"
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
                          <Trans id="enable.background.task" />
                        </Label>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="taskInterval"
                render={({ field }) => (
                  <FormItem className="col-span-3 text-sm">
                    <FormLabel className="text-xs">
                      <Trans id="background.task.interval.in.seconds" />
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={!form.getValues("taskEnabled")}
                        type="number"
                        className="h-8"
                        placeholder={t("e.g.") + " 120"}
                        min={1}
                        value={field.value?.toString() ?? undefined}
                        onChange={(e) => {
                          field.onChange(Number(e.target.value));
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="mt-4 grid grid-cols-4 items-center gap-4">
              <FormField
                control={form.control}
                name="cacheEnabled"
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
                          <Trans id="enable.caching" />
                        </Label>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cacheInterval"
                render={({ field }) => (
                  <FormItem className="col-span-3 text-sm">
                    <FormLabel className="text-xs">
                      <Trans id="cache.ttl.interval.in.seconds" />
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={!form.getValues("cacheEnabled")}
                        type="number"
                        className="h-8"
                        placeholder={t("e.g.") + " 3600"}
                        min={1}
                        value={field.value?.toString() ?? undefined}
                        onChange={(e) => {
                          field.onChange(Number(e.target.value));
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormItem className="text-sm">
              <FormLabel className="text-xs">
                <Trans id="secret.entries" />
              </FormLabel>
              <FormControl>
                <div className="flex flex-col gap-2">
                  <div className="rounded-md border">
                    <Table className="table-fixed">
                      <TableHeader>
                        <TableRow>
                          <TableHead style={{ width: 80 }}>
                            <Trans id="required" />
                          </TableHead>
                          <TableHead>
                            <Trans id="name" />
                          </TableHead>
                          <TableHead>
                            <Trans id="description" />
                          </TableHead>
                          <TableHead>
                            <Trans id="secret" />
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sourceSecretFormFields.fields.length ? (
                          sourceSecretFormFields.fields.map((row, index) => (
                            <TableRow key={row.id}>
                              <TableCell>
                                <FormField
                                  control={form.control}
                                  name={`sourceSecrets.${index}.required`}
                                  render={({ field }) => (
                                    <FormItem className="flex items-center justify-center">
                                      <FormControl>
                                        <Checkbox
                                          ref={field.ref}
                                          id={field.name}
                                          onBlur={field.onBlur}
                                          name={field.name}
                                          checked={field.value}
                                          onCheckedChange={field.onChange}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </TableCell>
                              <TableCell>
                                <FormField
                                  control={form.control}
                                  name={`sourceSecrets.${index}.name`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormControl>
                                        <Input
                                          className="h-7 rounded-sm bg-foreground/10 text-xs"
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </TableCell>
                              <TableCell>
                                <FormField
                                  control={form.control}
                                  name={`sourceSecrets.${index}.description`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormControl>
                                        <Input
                                          className="h-7 rounded-sm bg-foreground/10 text-xs"
                                          {...field}
                                          value={field.value ?? ""}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </TableCell>
                              <TableCell>
                                <FormField
                                  control={form.control}
                                  name={`sourceSecrets.${index}.secretId`}
                                  render={({ field }) => (
                                    <FormItem className="text-sm">
                                      <FormControl>
                                        <div className="flex items-center gap-2">
                                          <Select
                                            onValueChange={field.onChange}
                                            value={field.value ?? undefined}
                                          >
                                            <SelectTrigger>
                                              <SelectValue placeholder="Select a secret" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {secrets.data?.map(
                                                ({
                                                  id,
                                                  name,
                                                  description,
                                                  numSources,
                                                }) => (
                                                  <SelectItem
                                                    key={id}
                                                    value={id}
                                                  >
                                                    {name} -{" "}
                                                    <span className="opacity-50">
                                                      {description}
                                                    </span>{" "}
                                                    -{" "}
                                                    <span>
                                                      <Trans
                                                        id="used.in.number.sources"
                                                        number={numSources}
                                                      />
                                                    </span>
                                                  </SelectItem>
                                                ),
                                              )}
                                            </SelectContent>
                                          </Select>
                                          <Button
                                            className="h-6 w-7 p-0"
                                            variant="secondary"
                                            disabled={!field.value}
                                            type="button"
                                            onClick={() => {
                                              field.onChange(null);
                                            }}
                                          >
                                            <RotateCcw size={14} />
                                          </Button>
                                          <Button
                                            className="h-6 w-7 p-0"
                                            variant="destructive"
                                            type="button"
                                            onClick={() => {
                                              sourceSecretFormFields.remove(
                                                index,
                                              );
                                            }}
                                          >
                                            <Trash2 size={14} />
                                          </Button>
                                        </div>
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center">
                              <Trans id="no.results" />
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  <Button
                    className="gap-2"
                    size="sm"
                    variant="secondary"
                    type="button"
                    onClick={() => {
                      sourceSecretFormFields.append({
                        required: false,
                        name: "",
                        description: "",
                      });
                    }}
                  >
                    <Plus size={16} />
                    <Trans id="add.entry" />
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
            <div className="flex gap-2 pt-2">
              <FormField
                control={form.control}
                name="ignoreLists"
                render={({ field }) => {
                  const availableIgnoreLists =
                    sourceIgnoreLists.data?.filter(
                      ({ id }) =>
                        !field.value.some((ignoreList) => ignoreList.id === id),
                    ) ?? [];

                  return (
                    <FormItem className="flex-1 text-sm">
                      <FormLabel className="text-xs">
                        <Trans id="ignore.lists" />
                      </FormLabel>
                      <FormControl>
                        <div className="flex flex-col gap-2">
                          <Select
                            onValueChange={(name) => {
                              const id = sourceIgnoreLists.data?.find(
                                ({ name: listName }) => listName === name,
                              )?.id;
                              field.onChange([...field.value, { id, name }]);
                            }}
                            value=""
                            disabled={availableIgnoreLists.length === 0}
                          >
                            <SelectTrigger>
                              <SelectValue
                                placeholder={
                                  <Trans id="ignore.list.select.placeholder" />
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {availableIgnoreLists.map(({ id, name }) => (
                                <SelectItem key={id} value={name}>
                                  {name}
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
              <FormField
                control={form.control}
                name="providerId"
                render={({ field }) => {
                  const name = providers.data?.find(
                    (i) => field.value === i.id,
                  )?.name;

                  return (
                    <FormItem className="flex-1 text-sm">
                      <FormLabel className="text-xs">
                        <Trans id="linked.provider" />
                      </FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={(name) => {
                            const id = providers.data?.find(
                              ({ name: listName }) => listName === name,
                            )?.id;
                            field.onChange(id);
                          }}
                          value={name}
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                <Trans id="providers.select.placeholder" />
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {providers.data?.map(({ id, name }) => (
                              <SelectItem key={id} value={name}>
                                {name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </div>

            <FormField
              control={form.control}
              name="sourceCode"
              disabled={source?.kind === SourceKind.System}
              render={({ field }) => (
                <FormItem className="text-sm">
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-xs">
                      <Trans id="source.code" />
                    </FormLabel>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        // get the related config value for the source kind
                        const formSourceKind = form.getValues("kind");

                        let configEntry;

                        if (formSourceKind === SourceKind.Python) {
                          configEntry = config.data?.python_source_template;
                        } else if (formSourceKind === SourceKind.JavaScript) {
                          configEntry = config.data?.javascript_source_template;
                        }

                        if (configEntry) {
                          form.setValue(
                            "sourceCode",
                            configEntry.value ?? configEntry.defaultValue,
                          );
                        }
                      }}
                      className="gap-2"
                      disabled={source?.kind === SourceKind.System}
                    >
                      <RotateCcw size={16} />
                      <Trans id="reset.and.use.template" />
                    </Button>
                  </div>

                  <FormControl>
                    <Editor
                      value={field.value ?? ""}
                      onChange={
                        source?.kind === SourceKind.System
                          ? undefined
                          : field.onChange
                      }
                      sourceKind={form.watch("kind") as SourceKind}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </form>
    </Form>
  );
};

export default SourceEditCreate;

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
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
import { SectionPanelHeader } from "@/components/section-panel-header";
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
import { sourceKindIconMapping } from "@/data";
import { Editor } from "@/components/editor";
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
    .uuid()
    .nullish()
    .transform((x) => x ?? undefined),
  kind: z.string(),
  sourceCode: z.coerce
    .string()
    .nullish()
    .transform((x) => x ?? undefined),
  ignoreLists: z.array(
    z.object({
      id: z.string().uuid(),
      name: z.string(),
    }),
  ),
  sourceSecrets: z.array(
    z.object({
      secretId: z.coerce
        .string()
        .uuid()
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

type ExtraSourceProps = {
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
  onDelete: () => void;
  name?: undefined;
};

type WithoutSourceProps = {
  source?: undefined;
  ignoreLists?: undefined;
  sourceSecrets?: undefined;
  onDelete?: undefined;
  name?: string;
};

type Props = {
  onSubmit: (data: FormSchema) => void;
} & (ExtraSourceProps | WithoutSourceProps);

export const SourceEditCreate: React.FC<Props> = ({
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
          Cancel
        </Button>
      </Link>
      {source && source.kind !== SourceKind.System && (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="destructive" size="sm" className="gap-2">
              <Trash size={16} /> Delete
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you absolutely sure?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently{" "}
                <span className="font-semibold">{source.name}</span> as a
                source.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogPrimitive.Close asChild>
                <Button variant="secondary">Cancel</Button>
              </DialogPrimitive.Close>
              <Button
                variant="destructive"
                className="gap-2"
                onClick={onDelete}
              >
                <Trash size={16} /> Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      <Button className="gap-2" size="sm" type="submit">
        <Save size={16} />
        Save
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
          className="flex-col items-stretch 2xl:items-center 2xl:flex-row"
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
              <div className="flex 2xl:hidden gap-2 items-center">
                {cancelSaveDeleteSection}
              </div>
            </>
          }
          title={
            <div className="flex gap-2 flex-col 2xl:flex-row flex-1">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="flex-1 text-sm">
                    <FormLabel className="text-xs">Name</FormLabel>
                    <FormControl>
                      <Input
                        className="h-8"
                        placeholder="e.g. Abuse.ch"
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
                    <FormLabel className="text-xs">Description</FormLabel>
                    <FormControl>
                      <Input
                        className="h-8"
                        placeholder="e.g. Reputable provider of threat intelligence"
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
                    <FormLabel className="text-xs">Tags</FormLabel>
                    <FormControl>
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <Input
                            className="h-8 flex-1"
                            placeholder="e.g. threat-intelligence"
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
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
                            Add tag
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
                    <FormLabel className="text-xs">Kind</FormLabel>
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
                    <FormLabel className="text-xs">Favicon</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <img
                          src={field.value ?? undefined}
                          alt="favicon"
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
                            placeholder={
                              field.value
                                ? "Change favicon"
                                : "Upload a favicon image, will use URL's favicon if not provided"
                            }
                          />
                        </div>
                        <Button
                          variant="destructive"
                          type="button"
                          className={cn(
                            "h-8 w-8 p-0",
                            !field.value && "hidden",
                          )}
                          onClick={() => field.onChange("")}
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
                        Disabled/supported indicator types
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
                                className="gap-2 cursor-pointer"
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
                          Enable rate limiter
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
                      Maximum number of request per interval
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={!form.getValues("limitEnabled")}
                        type="number"
                        className="h-8"
                        placeholder="e.g. 50"
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
                    <FormLabel className="text-xs">Limit interval</FormLabel>
                    <FormControl>
                      <Input
                        disabled={!form.getValues("limitEnabled")}
                        type="number"
                        className="h-8"
                        placeholder="e.g. 360"
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
                          Enable background task
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
                      Background task interval in seconds
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={!form.getValues("taskEnabled")}
                        type="number"
                        className="h-8"
                        placeholder="e.g. 120"
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
                          Enable caching
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
                      Cache time-to-live interval in seconds
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={!form.getValues("cacheEnabled")}
                        type="number"
                        className="h-8"
                        placeholder="e.g. 3600"
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
              <FormLabel className="text-xs">Secret entries</FormLabel>
              <FormControl>
                <div className="flex flex-col gap-2">
                  <div className="rounded-md border">
                    <Table className="table-fixed">
                      <TableHeader>
                        <TableRow>
                          <TableHead style={{ width: 80 }}>Required</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Secret</TableHead>
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
                                          className="bg-foreground/10 h-7 rounded-sm text-xs"
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
                                          className="bg-foreground/10 h-7 rounded-sm text-xs"
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
                                                      Used in {numSources}{" "}
                                                      sources
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
                                            onClick={() =>
                                              sourceSecretFormFields.remove(
                                                index,
                                              )
                                            }
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
                              No results.
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
                    onClick={() =>
                      sourceSecretFormFields.append({
                        required: false,
                        name: "",
                        description: "",
                      })
                    }
                  >
                    <Plus size={16} />
                    Add entry
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
                    ) || [];

                  return (
                    <FormItem className="flex-1 text-sm">
                      <FormLabel className="text-xs">Ignore lists</FormLabel>
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
                              <SelectValue placeholder="Select an ignore list" />
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
                      <FormLabel className="text-xs">Linked provider</FormLabel>
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
                            <SelectValue placeholder="Select a provider" />
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
                    <FormLabel className="text-xs">Source code</FormLabel>
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
                      Reset and use template
                    </Button>
                  </div>

                  <FormControl>
                    <Editor
                      value={field.value ?? ""}
                      onChange={
                        source?.kind === SourceKind.System
                          ? () => {}
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

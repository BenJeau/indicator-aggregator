import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Plus, Power, Save, Trash, Trash2 } from "lucide-react";
import { useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import { IgnoreList, IndicatorKind } from "@/types/backendTypes";
import { SectionPanelHeader, Trans } from "@/components";
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
import { Badge } from "@/components/ui/badge";
import { sourcesQueryOptions } from "@/api/sources";
import { providersQueryOptions } from "@/api/providers";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  TableHeader,
  Table,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { useTranslation } from "@/i18n";

const formSchema = z.object({
  name: z.string().min(2).max(50),
  description: z.string().max(500),
  enabled: z.boolean(),
  global: z.boolean(),
  sources: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
    }),
  ),
  providers: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
    }),
  ),
  entries: z.array(
    z.object({
      data: z.string().min(1),
      indicatorKind: z.string().min(1),
    }),
  ),
});

export type FormSchema = z.infer<typeof formSchema>;

type ExtraListProps = {
  list: IgnoreList;
  sources: {
    id: string;
    name: string;
  }[];
  providers: {
    id: string;
    name: string;
  }[];
  entries: {
    data: string;
    indicatorKind: string;
  }[];
  onDelete: () => void;
  name?: undefined;
};

type WithoutListProps = {
  list?: undefined;
  sources?: undefined;
  providers?: undefined;
  entries?: undefined;
  onDelete?: undefined;
  name?: string;
};

type Props = {
  onSubmit: (data: FormSchema) => void;
} & (ExtraListProps | WithoutListProps);

const ListEditCreate: React.FC<Props> = ({
  list,
  sources = [],
  providers = [],
  entries = [{ data: "", indicatorKind: "" }],
  onSubmit,
  onDelete,
  ...props
}) => {
  const defaultValues = useCallback(
    () => ({
      name: props.name ?? "",
      description: "",
      enabled: true,
      global: false,
      sources,
      providers,
      entries: [...entries],
      ...list,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues(),
  });

  useEffect(() => {
    form.reset(defaultValues());
  }, [form, defaultValues]);

  const entryFormFields = useFieldArray({
    control: form.control,
    name: "entries",
  });

  const listSources = useQuery(sourcesQueryOptions);
  const listProviders = useQuery(providersQueryOptions);

  const { t } = useTranslation();

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex h-full flex-col"
      >
        <SectionPanelHeader
          titleContainerClassName={"items-center"}
          extraClassName={"self-end"}
          titleIcon={
            <FormField
              control={form.control}
              name="enabled"
              render={({ field }) => (
                <FormItem className="text-sm">
                  <FormControl>
                    <button
                      type="button"
                      className={cn(
                        "rounded-lg p-2 text-white",
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
          }
          title={
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="text-sm">
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
          }
          description={
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
                        t("e.g.") + " " + t("example.ignore.list.description")
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          }
          extra={
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
              {list && (
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
                          id="ignore.list.delete.confirmation.description"
                          name={
                            <span className="font-semibold">{list.name}</span>
                          }
                        />
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <DialogPrimitive.Close asChild>
                        <Button variant="secondary">
                          <Trans id="cancel" />
                        </Button>
                      </DialogPrimitive.Close>
                      <Button
                        variant="destructive"
                        className="gap-2"
                        onClick={onDelete}
                      >
                        <Trash size={16} />
                        <Trans id="delete" />
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
          }
        />
        <div className="overflow-y-scroll">
          <div className="flex flex-col gap-2 p-4">
            <FormField
              control={form.control}
              name="global"
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
                        <Trans id="ignore.list.global.checkbox.label" />
                      </Label>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="mt-2 flex gap-2">
              <FormField
                control={form.control}
                name="sources"
                render={({ field }) => {
                  const availableSources =
                    listSources.data?.filter(
                      ({ id }) =>
                        !field.value.some((source) => source.id === id),
                    ) || [];

                  return (
                    <FormItem className="flex-1 text-sm">
                      <FormLabel className="text-xs">
                        <Trans id="source" />
                      </FormLabel>
                      <FormControl>
                        <div className="flex flex-col gap-2">
                          <Select
                            onValueChange={(name) => {
                              const id = listSources.data?.find(
                                ({ name: sourceName }) => sourceName === name,
                              )?.id;
                              field.onChange([...field.value, { id, name }]);
                            }}
                            value=""
                            disabled={availableSources.length === 0}
                          >
                            <SelectTrigger>
                              <SelectValue
                                placeholder={
                                  <Trans id="sources.select.placeholder" />
                                }
                              />
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
              <FormField
                control={form.control}
                name="providers"
                render={({ field }) => {
                  const availableProviders =
                    listProviders.data?.filter(
                      ({ id }) =>
                        !field.value.some((ignoreList) => ignoreList.id === id),
                    ) || [];

                  return (
                    <FormItem className="flex-1 text-sm">
                      <FormLabel className="text-xs">
                        <Trans id="providers" />
                      </FormLabel>
                      <FormControl>
                        <div className="flex flex-col gap-2">
                          <Select
                            onValueChange={(name) => {
                              const id = listProviders.data?.find(
                                ({ name: listName }) => listName === name,
                              )?.id;
                              field.onChange([...field.value, { id, name }]);
                            }}
                            value=""
                            disabled={availableProviders.length === 0}
                          >
                            <SelectTrigger>
                              <SelectValue
                                placeholder={
                                  <Trans id="providers.select.placeholder" />
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {availableProviders.map(({ id, name }) => (
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
            </div>

            <FormItem className="text-sm">
              <FormLabel className="text-xs">
                <Trans id="entries" />
              </FormLabel>
              <FormControl>
                <div className="flex flex-col gap-2">
                  <div className="rounded-md border">
                    <Table className="table-fixed">
                      <TableHeader>
                        <TableRow>
                          <TableHead>
                            <Trans id="data" />
                          </TableHead>
                          <TableHead>
                            <Trans id="kind" />
                          </TableHead>
                          <TableHead style={{ width: 50 }}></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {entryFormFields.fields.length ? (
                          entryFormFields.fields.map((row, index) => (
                            <TableRow key={row.id}>
                              <TableCell>
                                <FormField
                                  control={form.control}
                                  name={`entries.${index}.data`}
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
                                  name={`entries.${index}.indicatorKind`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormControl>
                                        <Select
                                          onValueChange={field.onChange}
                                          value={field.value}
                                        >
                                          <SelectTrigger className="h-7 rounded-sm bg-primary/10 text-xs">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {Object.values(IndicatorKind).map(
                                              (value) => (
                                                <SelectItem
                                                  key={value}
                                                  value={value}
                                                >
                                                  {value}
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
                              </TableCell>
                              <TableCell>
                                <Button
                                  className="h-6 w-6 p-0"
                                  variant="destructive"
                                  onClick={() => entryFormFields.remove(index)}
                                  disabled={entryFormFields.fields.length === 1}
                                  type="button"
                                >
                                  <Trash2 size={14} />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={3} className="h-24 text-center">
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
                    onClick={() =>
                      entryFormFields.append({ data: "", indicatorKind: "" })
                    }
                  >
                    <Plus size={16} />
                    <Trans id="add.entry" />
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default ListEditCreate;

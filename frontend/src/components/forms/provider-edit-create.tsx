import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Plus, Power, Save, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { Provider } from "@/types/backendTypes";
import { SectionPanelHeader } from "@/components";
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
import { ignoreListsQueryOptions } from "@/api/ignoreLists";

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
  sources: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
    }),
  ),
  ignoreLists: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
    }),
  ),
});

export type FormSchema = z.infer<typeof formSchema>;

type ExtraProviderProps = {
  provider: Provider;
  ignoreLists: {
    id: string;
    name: string;
  }[];
  sources: {
    id: string;
    name: string;
  }[];
  onDelete: () => void;
  name?: undefined;
};

type WithoutProviderProps = {
  provider?: undefined;
  ignoreLists?: undefined;
  sources?: undefined;
  onDelete?: undefined;
  name?: string;
};

type Props = {
  onSubmit: (data: FormSchema) => void;
} & (ExtraProviderProps | WithoutProviderProps);

const ProviderEditCreate: React.FC<Props> = ({
  provider,
  ignoreLists = [],
  sources = [],
  onSubmit,
  onDelete,
  ...props
}) => {
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: props.name ?? "",
      description: "",
      url: "",
      tags: [],
      enabled: true,
      ignoreLists,
      sources,
      ...provider,
    },
  });

  useEffect(() => {
    if (props.name) {
      form.setValue("name", props.name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.name]);

  useEffect(() => {
    form.reset(provider);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider]);

  const [newTag, setNewTag] = useState("");

  const providerSources = useQuery(sourcesQueryOptions);
  const providerIgnoreLists = useQuery(ignoreListsQueryOptions);

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
          }
          description={
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
                  Cancel
                </Button>
              </Link>
              {provider && (
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
                        <span className="font-semibold">{provider.name}</span>{" "}
                        as a provider, linked sources will simple not have a
                        provider anymore.
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
          }
        />
        <div className="overflow-y-scroll">
          <div className="flex flex-col gap-2 p-4">
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
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem className="text-sm">
                    <FormLabel className="text-xs">URL</FormLabel>
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
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sources"
                render={({ field }) => {
                  const availableSources =
                    providerSources.data?.filter(
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
                              const id = providerSources.data?.find(
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
              <FormField
                control={form.control}
                name="ignoreLists"
                render={({ field }) => {
                  const availableIgnoreLists =
                    providerIgnoreLists.data?.filter(
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
                              const id = providerIgnoreLists.data?.find(
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
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default ProviderEditCreate;

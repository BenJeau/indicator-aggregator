import { Edit, Minus, Plus, Save, Trash2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";

import {
  secretValueQueryOptions,
  useCreateSecretMutation,
  useDeleteSecretMutation,
  usePatchSecretMutation,
} from "@/api/secrets";
import TitleEntryCount from "@/components/title-entry-count";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormItem,
  FormControl,
  FormField,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Table,
} from "@/components/ui/table";
import { AutoAnimate, Code, DatePicker, MaskValue, Trans } from "@/components";
import { SecretWithNumSources } from "@/types/backendTypes";
import { useTranslation } from "@/i18n";

const formSchema = z.object({
  name: z.string().min(2).max(50),
  description: z.string().max(500).optional(),
  value: z.string(),
  expiresAt: z.date().min(new Date()).optional(),
});

export type FormSchema = z.infer<typeof formSchema>;

interface Props {
  secrets: SecretWithNumSources[];
}

const SecretsTable: React.FC<Props> = ({ secrets }) => {
  const [showForm, setShowForm] = useState(false);
  const createSecretMutation = useCreateSecretMutation();
  const { t } = useTranslation();

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: undefined,
      value: "",
      expiresAt: undefined,
    },
  });

  const handleOnSubmit = async (values: FormSchema) => {
    await createSecretMutation.mutateAsync({
      ...values,
      expiresAt: values.expiresAt
        ? dayjs(values.expiresAt).utc().toISOString().slice(0, -1)
        : undefined,
    });
    form.reset();
    setShowForm(false);
  };

  return (
    <>
      <div className="flex flex-wrap justify-between gap-2">
        <div>
          <h2 className="flex items-baseline gap-2">
            <span className="font-semibold text-lg">
              <Trans id="secrets" />
            </span>
            <TitleEntryCount count={secrets.length} />
          </h2>
          <p className="text-xs">
            <Trans id="secrets.table.description.1" />{" "}
            <span className="font-semibold">
              <Trans id="secrets.table.description.2" />
            </span>
          </p>
        </div>
        <div className="flex items-end flex-1 justify-end">
          <Button
            className="gap-2"
            size="sm"
            onClick={() => setShowForm(true)}
            type="button"
            variant="secondary"
          >
            <Plus size={16} />
            <Trans id="add.new.secret" />
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleOnSubmit)}>
            <Table className="table-fixed">
              <TableHeader>
                <TableRow>
                  <TableHead
                    style={{ width: 180 }}
                    className="hidden xl:table-cell"
                  >
                    <Trans id="created.at" />
                  </TableHead>
                  <TableHead
                    style={{ width: 180 }}
                    className="hidden 2xl:table-cell"
                  >
                    <Trans id="updated.at" />
                  </TableHead>
                  <TableHead>
                    <Trans id="name" />
                    {showForm && " *"}
                  </TableHead>
                  <TableHead>
                    <Trans id="description" />
                  </TableHead>
                  <TableHead>
                    <Trans id="value" />
                    {showForm && " *"}
                  </TableHead>
                  <TableHead>
                    <Trans id="expires.at" />
                  </TableHead>
                  <TableHead
                    style={{ width: 100 }}
                    className="hidden lg:table-cell"
                  >
                    <Trans id="sources" />
                  </TableHead>
                  <TableHead style={{ width: 80 }}></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-xs">
                {secrets.length >= 0 &&
                  secrets.map((row) => (
                    <TableRowWithData row={row} key={row.id} />
                  ))}

                {showForm && (
                  <TableRow>
                    <TableCell className="italic opacity-50 hidden xl:table-cell">
                      <Trans id="now" />
                    </TableCell>
                    <TableCell className="italic opacity-50 hidden 2xl:table-cell">
                      <Trans id="now" />
                    </TableCell>
                    <TableCell>
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder={`${t("e.g.")} SOURCE_API_KEY`}
                                className="dark:bg-foreground/10 h-7 rounded-sm text-xs"
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
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder={t(
                                  "secrets.table.description.placholder",
                                )}
                                className="dark:bg-foreground/10 h-7 rounded-sm text-xs"
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
                        name="value"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder={`${t("e.g.")} ABCDEFGHIJKLMNOP`}
                                className="dark:bg-foreground/10 h-7 rounded-sm text-xs"
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
                        name="expiresAt"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <DatePicker
                                // @ts-expect-error Lazy
                                selected={field.value}
                                fromDate={new Date()}
                                onSelect={(date: Date) => field.onChange(date)}
                                buttonClassName="dark:bg-foreground/10 rounded-sm h-7 text-xs"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TableCell>
                    <TableCell className="italic opacity-50 hidden lg:table-cell">
                      0
                    </TableCell>
                    <TableCell>
                      <Button
                        type="submit"
                        className="h-6 w-6 p-0"
                        variant="success"
                      >
                        <Save size={16} />
                      </Button>
                      <Button
                        type="button"
                        className="ml-2 h-6 w-6 p-0"
                        variant="ghost"
                        onClick={() => {
                          form.reset();
                          setShowForm(false);
                        }}
                      >
                        <Minus size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                )}

                {secrets.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      <Trans id="no.results" />
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </form>
        </Form>
      </div>
    </>
  );
};

interface TableRowWithDataProps {
  row: SecretWithNumSources;
}

const TableRowWithData: React.FC<TableRowWithDataProps> = ({ row }) => {
  const secretValue = useQuery(secretValueQueryOptions(row.id));
  const deleteSecretMutation = useDeleteSecretMutation();
  const patchSecretMutation = usePatchSecretMutation();

  const { t } = useTranslation();

  const [edit, setEdit] = useState(false);

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: row.name,
      description: row.description,
      value: "",
      expiresAt: row.expiresAt
        ? dayjs.utc(row.expiresAt).local().toDate()
        : undefined,
    },
  });

  return (
    <TableRow className="h-10">
      <TableCell className="hidden xl:table-cell">
        {dayjs.utc(row.createdAt).local().format("LLL")}
      </TableCell>
      <TableCell className="hidden 2xl:table-cell">
        {dayjs.utc(row.updatedAt).local().format("LLL")}
      </TableCell>
      <AutoAnimate as={TableCell} className="py-0">
        {edit ? (
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={`${t("e.g.")} SOURCE_API_KEY`}
                    className="dark:bg-foreground/10 h-7 rounded-sm text-xs"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : (
          <Code>{row.name}</Code>
        )}
      </AutoAnimate>
      <AutoAnimate as={TableCell} className="py-0">
        {edit ? (
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={t("secrets.table.description.placholder")}
                    className="dark:bg-foreground/10 h-7 rounded-sm text-xs"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : (
          row.description ?? (
            <span className="italic opacity-50 lowercase">
              <Trans id="no.description" />
            </span>
          )
        )}
      </AutoAnimate>
      <AutoAnimate as={TableCell} className="py-0">
        {edit ? (
          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={`${t("e.g.")} ABCDEFGHIJKLMNOP`}
                    className="dark:bg-foreground/10 h-7 rounded-sm text-xs"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : (
          <MaskValue
            value={secretValue.data}
            copieable="whenShown"
            onToggle={(showValue) => {
              if (!showValue) {
                secretValue.refetch();
              }
            }}
          />
        )}
      </AutoAnimate>
      <AutoAnimate as={TableCell} className="py-0">
        {edit ? (
          <FormField
            control={form.control}
            name="expiresAt"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <DatePicker
                    // @ts-expect-error Lazy
                    selected={field.value}
                    fromDate={new Date()}
                    onSelect={(date: Date) => field.onChange(date)}
                    buttonClassName="dark:bg-foreground/10 rounded-sm h-7 text-xs"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : row.expiresAt ? (
          dayjs.utc(row.expiresAt).local().format("LL")
        ) : (
          <span className="italic opacity-50 lowercase">
            <Trans id="no.expiration" />
          </span>
        )}
      </AutoAnimate>
      <TableCell className="hidden lg:table-cell">{row.numSources}</TableCell>
      <AutoAnimate as={TableCell} className="py-0">
        <Button
          type="button"
          className="h-6 w-6 p-0"
          variant="ghost"
          onClick={async () => {
            if (!edit) {
              const data = await secretValue.refetch();
              form.setValue("value", data.data ?? "");
            }
            setEdit((prev) => !prev);
          }}
        >
          <Edit size={14} />
        </Button>
        {edit ? (
          <Button
            className="ml-2 h-6 w-6 p-0"
            variant="success"
            type="button"
            onClick={() => {
              form.handleSubmit(async (values) => {
                await patchSecretMutation.mutateAsync({
                  id: row.id,
                  data: {
                    ...values,
                    expiresAt: values.expiresAt
                      ? dayjs(values.expiresAt).utc().toISOString().slice(0, -1)
                      : undefined,
                  },
                });
                form.reset();
                setEdit(false);
              })();
            }}
          >
            <Save size={14} />
          </Button>
        ) : (
          <Button
            className="ml-2 h-6 w-6 p-0"
            variant="destructive"
            type="button"
            onClick={() => deleteSecretMutation.mutate(row.id)}
          >
            <Trash2 size={14} />
          </Button>
        )}
      </AutoAnimate>
    </TableRow>
  );
};

export default SecretsTable;

import {
  Edit,
  Loader2,
  Minus,
  Plus,
  RefreshCcw,
  Save,
  Trash,
  Trash2,
} from "lucide-react";
import dayjs from "dayjs";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { useAtomValue } from "jotai";

import TitleEntryCount from "@/components/title-entry-count";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormItem,
  FormControl,
  FormField,
  FormMessage,
} from "@/components/ui/form";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import { ApiToken } from "@/types/backendTypes";
import { useTranslation } from "@/i18n";
import {
  useCreateApiTokenMutation,
  useDeleteApiTokenMutation,
  useDeleteUserApiTokensMutation,
  useRegenerateApiTokenMutation,
  useUpdateApiTokenMutation,
} from "@/api/apiTokens";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { userAtom } from "@/atoms/auth";

const formSchema = z.object({
  note: z.string().min(2).max(500),
  expiresAt: z.date().min(new Date()).nullable().optional(),
});

export type FormSchema = z.infer<typeof formSchema>;

interface Props {
  apiTokens: ApiToken[];
}

const ApiTokensTable: React.FC<Props> = ({ apiTokens }) => {
  const [showForm, setShowForm] = useState(false);
  const createApiToken = useCreateApiTokenMutation();
  const { t } = useTranslation();
  const deleteApiTokens = useDeleteUserApiTokensMutation();
  const user = useAtomValue(userAtom);

  const [apiTokenValues, setApiTokenValues] = useState<Record<string, string>>(
    {},
  );

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: { note: "", expiresAt: null },
  });

  const handleOnSubmit = async (values: FormSchema) => {
    const token = await createApiToken.mutateAsync({
      note: values.note,
      // @ts-expect-error Lazy to fix atm
      expiresAt: values.expiresAt
        ? dayjs(values.expiresAt).utc().toISOString().slice(0, -1)
        : null,
    });

    toast(<Trans id="api.token.created.title" />, {
      description: <Trans id="api.token.created.description" />,
    });

    setApiTokenValues((prev) => ({ ...prev, [token.id]: token.token }));

    form.reset();
    setShowForm(false);
  };

  return (
    <>
      <div className="flex flex-wrap justify-between gap-2">
        <div>
          <h2 className="flex items-baseline gap-2">
            <span className="text-lg font-semibold">
              <Trans id="api.tokens" />
            </span>
            <TitleEntryCount count={apiTokens.length} />
          </h2>
          <p className="text-xs">
            <Trans
              id="api.tokens.table.description"
              header={<Code>Authentication</Code>}
              headerFormat={<Code>Token API_TOKEN</Code>}
            />
          </p>
        </div>
        <div className="flex flex-1 flex-wrap items-end justify-end gap-2 md:flex-nowrap">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                className="gap-2"
                size="sm"
                type="button"
                variant="destructive"
                disabled={apiTokens.length === 0}
              >
                <Trash size={16} />
                <Trans id="delete.user.api.tokens" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  <Trans id="delete.confirmation.title" />
                </AlertDialogTitle>
                <AlertDialogDescription>
                  <Trans id="api.tokens.delete.confirmation.description" />
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>
                  <Trans id="cancel" />
                </AlertDialogCancel>
                <AlertDialogPrimitive.Action>
                  <Button
                    onClick={async () => {
                      await deleteApiTokens.mutateAsync(user!.id);
                      toast(<Trans id="api.tokens.deleted" />);
                    }}
                    disabled={deleteApiTokens.isPending}
                    variant="destructive"
                    className="gap-2"
                  >
                    {deleteApiTokens.isPending ? (
                      <Loader2 className="animate-spin" size={14} />
                    ) : (
                      <Trash size={14} />
                    )}
                    <Trans id="delete.user.api.tokens" />
                  </Button>
                </AlertDialogPrimitive.Action>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button
            className="gap-2"
            size="sm"
            onClick={() => {
              setShowForm(true);
            }}
            type="button"
            variant="secondary"
          >
            <Plus size={16} />
            <Trans id="add.new.api.token" />
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
                    style={{ width: 150 }}
                    className="hidden xl:table-cell"
                  >
                    <Trans id="created.at" />
                  </TableHead>
                  <TableHead
                    style={{ width: 150 }}
                    className="hidden 2xl:table-cell"
                  >
                    <Trans id="updated.at" />
                  </TableHead>
                  <TableHead>
                    <Trans id="note" />
                    {showForm && " *"}
                  </TableHead>
                  <TableHead style={{ width: 420 }}>
                    <Trans id="value" />
                  </TableHead>
                  <TableHead>
                    <Trans id="expires.at" />
                  </TableHead>
                  <TableHead style={{ width: 110 }} />
                </TableRow>
              </TableHeader>
              <TableBody className="text-xs">
                {showForm && (
                  <TableRow>
                    <TableCell className="hidden italic opacity-50 xl:table-cell">
                      <Trans id="now" />
                    </TableCell>
                    <TableCell className="hidden italic opacity-50 2xl:table-cell">
                      <Trans id="now" />
                    </TableCell>
                    <TableCell>
                      <FormField
                        control={form.control}
                        name="note"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder={`${t("e.g.")} ${t("api.token.note.placeholder")}`}
                                className="h-7 rounded-sm text-xs dark:bg-foreground/10"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <MaskValue disableToggle />
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
                                onSelect={(date: Date) => {
                                  field.onChange(date);
                                }}
                                buttonClassName="dark:bg-foreground/10 rounded-sm h-7 text-xs"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        className="ml-8 h-6 w-6 p-0"
                        variant="ghost"
                        onClick={() => {
                          form.reset();
                          setShowForm(false);
                        }}
                      >
                        <Minus size={16} />
                      </Button>
                      <Button
                        type="submit"
                        className="ml-2 h-6 w-6 p-0"
                        variant="success"
                      >
                        <Save size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                )}

                {apiTokens.length >= 0 &&
                  apiTokens.map((row) => (
                    <TableRowWithData
                      row={row}
                      key={row.id}
                      apiTokenValue={apiTokenValues[row.id]}
                    />
                  ))}

                {apiTokens.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
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
  row: ApiToken;
  apiTokenValue?: string;
}

const TableRowWithData: React.FC<TableRowWithDataProps> = ({
  row,
  apiTokenValue,
}) => {
  const deleteApiTokenMutation = useDeleteApiTokenMutation();
  const updateApiTokenMutation = useUpdateApiTokenMutation();
  const regenerateApiTokenMutation = useRegenerateApiTokenMutation();

  const [apiToken, setApiToken] = useState<string | undefined>(apiTokenValue);

  const { t } = useTranslation();

  const [edit, setEdit] = useState(false);

  const defaultValues = useMemo(
    () => ({
      note: row.note,
      expiresAt: row.expiresAt
        ? dayjs.utc(row.expiresAt).local().toDate()
        : undefined,
    }),
    [row],
  );

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  useEffect(() => {
    if (form.getValues() !== defaultValues) {
      form.reset(defaultValues);
    }
  }, [form, defaultValues]);

  useEffect(() => {
    if (apiTokenValue !== apiToken) {
      setApiToken(apiTokenValue);
    }
    // This needs to be like this, or else when you regenerate the API token, it will not be updated in the UI
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiTokenValue]);

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
            name="note"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={t("secrets.table.description.placholder")}
                    className="h-7 rounded-sm text-xs dark:bg-foreground/10"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : (
          row.note || (
            <span className="lowercase italic opacity-50">
              <Trans id="no.description" />
            </span>
          )
        )}
      </AutoAnimate>
      <TableCell>
        <MaskValue
          disableToggle={!apiToken}
          value={apiToken ? `${row.id}_${apiToken}` : undefined}
          copieable={apiToken ? "always" : "never"}
        />
      </TableCell>
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
                    onSelect={(date: Date | null) => {
                      form.setValue("expiresAt", date);
                    }}
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
          <span className="lowercase italic opacity-50">
            <Trans id="no.expiration" />
          </span>
        )}
      </AutoAnimate>
      <TableCell className="py-0">
        <Tooltip>
          <TooltipTrigger>
            <Button
              type="button"
              className="h-6 w-6 p-0"
              variant="ghost"
              onClick={async () => {
                const token = await regenerateApiTokenMutation.mutateAsync(
                  row.id,
                );
                setApiToken(token);

                toast(<Trans id="api.token.regenerated.title" />, {
                  description: <Trans id="api.token.regenerated.description" />,
                });
              }}
            >
              <RefreshCcw size={14} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="w-40 text-wrap">
              <h6 className="font-bold">
                <Trans id="api.token.regenerate.tooltip.title" />
              </h6>
              <Trans id="api.token.regenerate.tooltip.details" />
            </p>
          </TooltipContent>
        </Tooltip>
        <Button
          type="button"
          className="ml-2 h-6 w-6 p-0"
          variant="ghost"
          onClick={() => {
            if (!edit) {
              form.resetField("note");
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
            onClick={async () => {
              await form.handleSubmit(async (values) => {
                await updateApiTokenMutation.mutateAsync({
                  id: row.id,
                  data: {
                    ...values,
                    // @ts-expect-error Lazy to fix atm
                    expiresAt: values.expiresAt
                      ? dayjs(values.expiresAt).utc().toISOString().slice(0, -1)
                      : null,
                  },
                });
                form.reset();
                setEdit(false);
                toast(<Trans id="api.token.updated" />);
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
            onClick={async () => {
              await deleteApiTokenMutation.mutateAsync(row.id);
              toast(<Trans id="api.token.deleted" />);
            }}
          >
            <Trash2 size={14} />
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
};

export default ApiTokensTable;

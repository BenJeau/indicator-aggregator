import {
  Asterisk,
  Edit,
  Eye,
  EyeOff,
  Minus,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
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
import { DatePicker } from "@/components/date-picker";
import { SecretWithNumSources } from "@/types/backendTypes";

const formSchema = z.object({
  name: z.string().min(2).max(50),
  description: z.string().max(500).optional(),
  value: z.string(),
  expiresAt: z.date().min(new Date()).optional(),
});

export type FormSchema = z.infer<typeof formSchema>;

interface Props {
  secrets: SecretWithNumSources[];
  showForm: boolean;
  setShowForm: (show: boolean) => void;
}

const SecretsTable: React.FC<Props> = ({ secrets, showForm, setShowForm }) => {
  const createSecretMutation = useCreateSecretMutation();

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
            <span className="font-semibold text-lg">Secrets</span>
            <TitleEntryCount count={secrets.length} />
          </h2>
          <p className="text-xs">
            Secrets are used to store sensitive information such as API keys,
            passwords, and other credentials.{" "}
            <span className="font-semibold">
              Data is encrypted in transit, encrypted at the application level,
              and doubly encrypted at rest.
            </span>
          </p>
        </div>
        <Button
          className="gap-2"
          size="sm"
          onClick={() => setShowForm(true)}
          type="button"
          variant="secondary"
        >
          <Plus size={16} />
          Add new secret
        </Button>
      </div>

      <div className="rounded-md border">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleOnSubmit)}>
            <Table className="table-fixed">
              <TableHeader>
                <TableRow>
                  <TableHead style={{ width: 180 }}>Created At</TableHead>
                  <TableHead style={{ width: 180 }}>Updated At</TableHead>
                  <TableHead>Name{showForm && " *"}</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Value{showForm && " *"}</TableHead>
                  <TableHead>Expires At</TableHead>
                  <TableHead style={{ width: 100 }}>Sources</TableHead>
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
                    <TableCell className="italic opacity-50">Now</TableCell>
                    <TableCell className="italic opacity-50">Now</TableCell>
                    <TableCell>
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="e.g. SOURCE_API_KEY"
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
                                placeholder="e.g. used to authenticate for X service"
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
                                placeholder="e.g. ABCDEFGHIJKLMNOP"
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
                    <TableCell className="italic opacity-50">0</TableCell>
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
                      No results.
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

  const [showValue, setShowValue] = useState(false);
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
    <TableRow>
      <TableCell>{dayjs.utc(row.createdAt).local().format("LLL")}</TableCell>
      <TableCell>{dayjs.utc(row.updatedAt).local().format("LLL")}</TableCell>
      <TableCell>
        {edit ? (
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="e.g. SOURCE_API_KEY"
                    className="dark:bg-foreground/10 h-7 rounded-sm text-xs"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : (
          <code className="bg-foreground/5 dark:bg-foreground/30 rounded-sm px-1">
            {row.name}
          </code>
        )}
      </TableCell>
      <TableCell>
        {edit ? (
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="e.g. used to authenticate for X service"
                    className="dark:bg-foreground/10 h-7 rounded-sm text-xs"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : (
          row.description ?? (
            <span className="italic opacity-50">no description</span>
          )
        )}
      </TableCell>
      <TableCell>
        {edit ? (
          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="e.g. ABCDEFGHIJKLMNOP"
                    className="dark:bg-foreground/10 h-7 rounded-sm text-xs"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : (
          <div className="flex w-full items-center justify-between gap-2">
            {showValue ? (
              <code className="bg-foreground/5 dark:bg-foreground/30 rounded-sm px-1">
                {secretValue.data}
              </code>
            ) : (
              <div className="flex">
                <Asterisk size={12} className="-ml-1" />
                <Asterisk size={12} className="-ml-1" />
                <Asterisk size={12} className="-ml-1" />
                <Asterisk size={12} className="-ml-1" />
                <Asterisk size={12} className="-ml-1" />
                <Asterisk size={12} className="-ml-1" />
                <Asterisk size={12} className="-ml-1" />
                <Asterisk size={12} className="-ml-1" />
                <Asterisk size={12} className="-ml-1" />
                <Asterisk size={12} className="-ml-1" />
                <Asterisk size={12} className="-ml-1" />
                <Asterisk size={12} className="-ml-1" />
                <Asterisk size={12} className="-ml-1" />
                <Asterisk size={12} className="-ml-1" />
                <Asterisk size={12} className="-ml-1" />
                <Asterisk size={12} className="-ml-1" />
                <Asterisk size={12} className="-ml-1" />
              </div>
            )}
            <Button
              className="h-6 w-6 p-0"
              variant="ghost"
              type="button"
              onClick={() => {
                if (!showValue) {
                  secretValue.refetch();
                }
                setShowValue((prev) => !prev);
              }}
            >
              {showValue ? <EyeOff size={14} /> : <Eye size={14} />}
            </Button>
          </div>
        )}
      </TableCell>
      <TableCell>
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
          <span className="italic opacity-50">no expiration</span>
        )}
      </TableCell>
      <TableCell>{row.numSources}</TableCell>
      <TableCell>
        {edit ? (
          <Button
            className="h-6 w-6 p-0"
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
            className="h-6 w-6 p-0"
            variant="destructive"
            type="button"
            onClick={() => deleteSecretMutation.mutate(row.id)}
          >
            <Trash2 size={14} />
          </Button>
        )}
        <Button
          type="button"
          className="ml-2 h-6 w-6 p-0"
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
      </TableCell>
    </TableRow>
  );
};

export default SecretsTable;

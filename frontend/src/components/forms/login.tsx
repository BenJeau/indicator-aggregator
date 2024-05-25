import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CircleAlert, Loader2, LogIn } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AutoAnimate, Trans } from "@/components";
import { useTranslation } from "@/i18n";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export type FormSchema = z.infer<typeof formSchema>;

interface Props {
  onSubmit: (data: FormSchema) => void;
  loading: boolean;
  error: boolean;
}

const Login: React.FC<Props> = ({ onSubmit, loading, error }) => {
  const { t } = useTranslation();
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  const [errorValues, setErrorValues] = useState<FormSchema>(form.getValues());

  useEffect(() => {
    if (error) {
      setErrorValues(form.getValues());
    }
  }, [error, form]);

  const values = form.watch();

  const isError = useMemo(() => {
    return (
      error &&
      values.email === errorValues.email &&
      values.password === errorValues.password
    );
  }, [error, errorValues, values]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex h-full flex-col gap-2"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder={t("email").toLowerCase()} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  placeholder={t("password").toLowerCase()}
                  type="password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <AutoAnimate>
          <Button
            className="gap-2 w-full"
            type="submit"
            variant={isError ? "destructive" : undefined}
            disabled={loading}
          >
            <AutoAnimate>
              {loading && <Loader2 size={16} className="animate-spin" />}
              {isError && <CircleAlert size={16} />}
              {!loading && !isError && <LogIn size={16} />}
            </AutoAnimate>
            <Trans id="authenticate" />
          </Button>
        </AutoAnimate>
      </form>
    </Form>
  );
};

export default Login;

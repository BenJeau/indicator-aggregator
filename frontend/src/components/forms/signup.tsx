import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2, LogIn } from "lucide-react";

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
  name: z.string(),
  email: z.string().email(),
  password: z.string(),
});

export type FormSchema = z.infer<typeof formSchema>;

interface Props {
  onSubmit: (data: FormSchema) => void;
  loading: boolean;
}

const Signup: React.FC<Props> = ({ onSubmit, loading }) => {
  const { t } = useTranslation();
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex h-full flex-col gap-2"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder={t("name").toLowerCase()} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
          <Button className="gap-2 w-full" type="submit" disabled={loading}>
            <AutoAnimate>
              {loading && <Loader2 size={16} className="animate-spin" />}
              {!loading && <LogIn size={16} />}
            </AutoAnimate>
            <Trans id="create.account" />
          </Button>
        </AutoAnimate>
      </form>
    </Form>
  );
};

export default Signup;

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Power, Save } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { SectionPanelHeader, Trans } from "@/components";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { User } from "@/types/backendTypes";
import { ArrayField } from "@/components/forms/inputs";
import { useTranslation } from "@/i18n";

const formSchema = z.object({
  enabled: z.boolean(),
  roles: z.array(z.string()),
});

export type FormSchema = z.infer<typeof formSchema>;

interface Props {
  user: User;
  onSubmit: (data: FormSchema) => void;
}

const UserEdit: React.FC<Props> = ({ user, onSubmit }) => {
  const { t } = useTranslation();
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: { enabled: user.enabled, roles: user.roles },
  });

  useEffect(() => {
    form.reset({ enabled: user.enabled, roles: user.roles });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

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
                        field.value ? "bg-green-500" : "bg-red-500"
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
              <Button className="gap-2" size="sm" type="submit">
                <Save size={16} />
                <Trans id="save" />
              </Button>
            </>
          }
        />
        <div className="p-4">
          <ArrayField
            // @ts-expect-error Lazy to fix - complains about the form not having the right type - unsure how to properly type it...
            control={form.control}
            name="roles"
            label={t("roles")}
            placeholder={`${t("e.g.")} admin`}
            addLabel={t("roles.add")}
          />
        </div>
      </form>
    </Form>
  );
};

export default UserEdit;

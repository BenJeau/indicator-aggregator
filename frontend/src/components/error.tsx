import {
  AlertTriangle,
  ChevronsDown,
  Home,
  LogOut,
  MailWarning,
  RefreshCw,
} from "lucide-react";
import { ErrorInfo } from "react";

import Image from "@/assets/this-is-fine.gif";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import config from "@/lib/config";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RawContent, Trans, Layouts } from "@/components";
import { useTranslation } from "@/i18n";
import { useUpdateTheme } from "@/atoms/theme";

interface Props {
  info?: ErrorInfo;
  error: Error | unknown;
}

const ErrorComponent: React.FC<Props> = ({ info, error }) => {
  const { t } = useTranslation();
  useUpdateTheme();

  const errorMessage =
    error instanceof Error ? error.message : t("unknown.error");
  const errorName = error instanceof Error ? error.name : t("unknown.error");
  const errorStack = error instanceof Error ? error.stack : t("unknown.error");

  return (
    <div className="container relative mx-auto flex min-h-screen items-center justify-center gap-8 p-4 dark:text-white">
      <div className="hidden h-[20rem] w-[20rem] flex-col gap-6 lg:flex xl:h-[30rem] xl:w-[30rem] ">
        <img
          src={Image}
          className="h-fit w-fit rounded-xl object-cover  text-white shadow-xl border border-black dark:border-border"
        />

        <div className="items-center hidden flex-wrap justify-between gap-4 xl:flex">
          <Layouts.Public.Footer />
        </div>
      </div>

      <div className="relative flex flex-1 flex-col gap-2">
        <div className="font-serif text-5xl font-bold leading-[1] text-500 sm:text-7xl lg:text-8xl xl:text-9xl z-10">
          <Trans id="error.unexpected.title" />
        </div>

        <div className="absolute -right-5 -top-10 ms-4 font-serif text-7xl font-bold leading-5 text-primary/30 dark:text-800 sm:text-7xl md:text-9xl xl:top-10 xl:text-[10rem] select-none">
          x⸑x
        </div>
        <div className="mb-2 text-sm">
          <Trans id="error.unexpected.description" />
        </div>
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1" className="border-none">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex flex-wrap gap-2">
                <Button asChild>
                  <a href="/" className="gap-2">
                    <Home size={16} />
                    <Trans id="home" />
                  </a>
                </Button>
                <Button
                  variant="secondary"
                  className="gap-2"
                  onClick={() => {
                    window.location.reload();
                  }}
                >
                  <RefreshCw size={16} />
                  <Trans id="refresh" />
                </Button>
                <Button variant="secondary" asChild>
                  <a href="/auth/logout" className="gap-2">
                    <LogOut size={16} />
                    <Trans id="logout" />
                  </a>
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="link" asChild>
                  <a
                    href={`mailto:${config.admin_email}?subject=Error%20Report`}
                    className="mx-2 my-2 gap-2"
                  >
                    <MailWarning size={16} />
                    <Trans id="contact.admin" />
                  </a>
                </Button>
                <AccordionTrigger
                  showChevron={false}
                  className="mx-2 my-2 gap-2 p-0"
                >
                  <ChevronsDown size={16} />
                  <Trans id="error.toggle" />
                </AccordionTrigger>
              </div>
            </div>
            <AccordionContent className="mt-4 pb-2">
              <Tabs
                defaultValue="error"
                className="flex flex-col gap-2 rounded border bg-background p-4 shadow-md dark:border-800 dark:bg-950"
              >
                <div className="flex justify-between">
                  <h3 className="flex gap-2 text-2xl font-medium text-800 dark:text-white">
                    <AlertTriangle size={32} strokeWidth={2.5} /> {errorName}
                  </h3>
                  <TabsList>
                    <TabsTrigger value="error">
                      <Trans id="error.stack" />
                    </TabsTrigger>
                    <TabsTrigger value="component">
                      <Trans id="component.stack" />
                    </TabsTrigger>
                  </TabsList>
                </div>
                <p>{errorMessage}</p>
                <TabsContent value="error">
                  <RawContent content={errorStack?.trim()} />
                </TabsContent>
                <TabsContent value="component">
                  <RawContent content={info?.componentStack?.trim()} />
                </TabsContent>
              </Tabs>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="mt-6 flex flex-wrap justify-between gap-4 xl:hidden items-center">
          <Layouts.Public.Footer />
        </div>
      </div>
    </div>
  );
};

export default ErrorComponent;

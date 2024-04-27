import { createFileRoute } from "@tanstack/react-router";
import { TrainFrontTunnel } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import config from "@/config";
import { Icons, Layouts, Trans } from "@/components";

const Login: React.FC = () => {
  const { next } = Route.useSearch();

  const query = next ? `?next=${next}` : "";

  return (
    <div className="relative grid h-[800px] flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="hidden h-full flex-col gap-6 lg:flex">
        <div className="bg-muted relative flex h-full flex-grow flex-col rounded-xl text-white border">
          <div
            className="absolute inset-0 bg-cover rounded-xl"
            style={{
              backgroundImage:
                "url(https://images.unsplash.com/photo-1545987796-b199d6abb1b4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%253D%253D&auto=format&fit=crop&w=1376&q=80)",
            }}
          />
          <div className="relative z-20 flex items-center rounded-xl p-10 text-5xl font-semibold gap-4">
            <TrainFrontTunnel size={48} className="text-yellow-300" />
            <span className="text-yellow-300">Indicator</span> Aggregator
          </div>
          <div className="relative z-20 mt-auto p-10">
            <p className="text-lg">
              <Trans id="login.description" />
            </p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 top-0 rounded-xl bg-gradient-to-t from-transparent via-transparent to-black opacity-90" />
          <div className="absolute bottom-0 left-0 right-0 top-0 rounded-xl bg-gradient-to-t from-black via-transparent to-transparent opacity-70 blur-md transition-all duration-500 hover:blur-none" />
        </div>
        <div className="flex justify-between items-center">
          <Layouts.Public.Footer />
        </div>
      </div>
      <div className="absolute left-4 top-4 lg:hidden">
        <div className="relative z-20 flex items-center text-4xl font-semibold text-black dark:text-white gap-4">
          <TrainFrontTunnel size={48} className="text-yellow-300" />
          <span className="text-yellow-300">Indicator</span> Aggregator
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              <Trans id="authentication" />
            </h1>
            <p className="text-muted-foreground text-sm">
              <Trans id="authentication.description.1" />{" "}
              <span className="font-medium">Google</span> <Trans id="or" />{" "}
              <span className="font-medium">Microsoft</span>{" "}
              <Trans id="authentication.description.2" />
            </p>
          </div>
          <div className={cn("grid gap-2")}>
            <Button type="button" className="gap-2 shadow-md" asChild>
              <a href={`${config.rest_server_base_url}/auth/google${query}`}>
                <Icons.Google />
                Google
              </a>
            </Button>
            <Button type="button" className="gap-2" asChild variant="secondary">
              <a href={`${config.rest_server_base_url}/auth/microsoft${query}`}>
                <Icons.Microsoft />
                Microsoft
              </a>
            </Button>
          </div>
        </div>
      </div>
      <div className="absolute bottom-4 left-4 right-4 flex flex-wrap justify-between gap-4 items-center lg:hidden">
        <Layouts.Public.Footer />
      </div>
      <div className="absolute right-0 top-0 -z-10 -mx-6 select-none">
        <div
          className="text-end font-serif text-9xl font-extralight lowercase text-950 opacity-50 dark:text-500 dark:opacity-100"
          style={{
            transformOrigin: "0 0",
            width: 300,
            transform: "rotate(90deg) translate(0%, -250%)",
          }}
        >
          <Trans id="login" />
        </div>
      </div>
    </div>
  );
};

type SearchParams = {
  next?: string;
};

export const Route = createFileRoute("/login")({
  component: Login,
  validateSearch: (search: SearchParams): SearchParams => search,
});

import { useMemo } from "react";
import { TrainFrontTunnel } from "lucide-react";

import { Layouts, Trans } from "@/components";
import { getRandomBackground } from "@/assets";
import { useTranslation } from "@/i18n";

export const Authentication: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const bg = useMemo(() => getRandomBackground(), []);
  const { t } = useTranslation();

  return (
    <div className="relative grid h-[800px] flex-col items-center justify-center lg:max-w-none lg:grid-cols-5 lg:ps-4">
      <div className="col-span-3 hidden h-full flex-col gap-6 lg:flex">
        <div className="relative h-full flex-grow overflow-hidden rounded-xl border border-black bg-muted text-white dark:border-border">
          <img
            id="lowres-login-img"
            src={bg.small}
            alt={t("login.image.blurry.alt")}
            className="absolute h-full flex-1 object-cover blur-xl"
          />
          <img
            id="login-img"
            src={bg.big}
            alt={t("login.image.alt")}
            className="absolute h-full flex-1 object-cover opacity-0 blur-xl transition duration-1000 ease-out"
            style={{ transitionProperty: "filter" }}
            onLoad={() => {
              setTimeout(() => {
                document
                  .querySelector("#lowres-login-img")
                  ?.classList.add("opacity-0");
                document
                  .querySelector("#login-img")
                  ?.classList.remove("blur-xl");
                document
                  .querySelector("#login-img")
                  ?.classList.remove("opacity-0");
              }, 500);
            }}
          />
          <div className="absolute inset-0 flex flex-col">
            <div className="relative z-20 flex flex-col gap-4 p-10">
              <div className="flex items-center gap-4 rounded-xl text-5xl font-semibold">
                <TrainFrontTunnel size={48} className="min-w-12 text-primary" />
                <span className="text-primary">Indicator</span> Aggregator
              </div>
              <Trans id="tagline" />
            </div>
            <div className="relative z-20 mt-auto p-10">
              <p className="text-lg font-medium">
                <Trans id="login.description" />
              </p>
            </div>
            <div className="absolute bottom-0 left-0 right-0 top-0 rounded-xl bg-gradient-to-t from-transparent via-transparent to-black opacity-90" />
            <div className="absolute bottom-0 left-0 right-0 top-0 rounded-xl bg-gradient-to-t from-black via-transparent to-transparent opacity-70 blur-md transition-all duration-500 hover:blur-none" />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <Layouts.Public.Footer />
        </div>
      </div>
      <div className="absolute left-4 top-4 lg:hidden">
        <div className="relative z-20 flex flex-wrap items-center gap-x-2 text-3xl font-semibold text-black dark:text-white sm:gap-4 sm:text-5xl">
          <TrainFrontTunnel className="h-12 text-primary sm:w-12" />
          <span className="text-primary">Indicator</span> Aggregator
        </div>
      </div>
      <div className="lg:col-span-2 lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-8 sm:w-[350px]">
          {children}
        </div>
      </div>
      <div className="absolute bottom-0 left-4 right-4 mt-8 flex flex-wrap items-center justify-between gap-4 lg:hidden">
        <Layouts.Public.Footer />
      </div>
    </div>
  );
};

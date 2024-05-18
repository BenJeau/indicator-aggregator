import { useMemo } from "react";
import { TrainFrontTunnel } from "lucide-react";

import { Layouts, Trans } from "@/components";
import { getRandomBackground } from "@/assets";

export const Authentication: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const bg = useMemo(getRandomBackground, []);

  return (
    <div className="relative grid h-[800px] flex-col items-center justify-center lg:max-w-none lg:grid-cols-5 lg:ps-4 ">
      <div className="hidden h-full flex-col gap-6 lg:flex col-span-3">
        <div className="bg-muted relative h-full flex-grow rounded-xl text-white border border-black dark:border-border overflow-hidden">
          <img
            id="lowres-login-img"
            src={bg.small}
            className="absolute object-cover blur-xl flex-1 h-full"
          />
          <img
            id="login-img"
            src={bg.big}
            className="absolute object-cover blur-xl transition duration-1000 ease-out flex-1 h-full opacity-0"
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
            <div className="relative z-20 p-10 flex flex-col gap-4">
              <div className="flex items-center rounded-xl text-5xl font-semibold gap-4">
                <TrainFrontTunnel size={48} className="text-primary min-w-12" />
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
        <div className="flex justify-between items-center">
          <Layouts.Public.Footer />
        </div>
      </div>
      <div className="absolute left-4 top-4 lg:hidden">
        <div className="relative z-20 flex items-center text-3xl sm:text-5xl font-semibold text-black dark:text-white gap-x-2 sm:gap-4 flex-wrap">
          <TrainFrontTunnel className="text-primary  sm:w-12 h-12" />
          <span className="text-primary">Indicator</span> Aggregator
        </div>
      </div>
      <div className="lg:p-8 lg:col-span-2">
        <div className="mx-auto flex w-full flex-col justify-center space-y-8 sm:w-[350px]">
          {children}
        </div>
      </div>
      <div className="absolute bottom-0 left-4 right-4 flex flex-wrap justify-between gap-4 items-center lg:hidden mt-8">
        <Layouts.Public.Footer />
      </div>
    </div>
  );
};
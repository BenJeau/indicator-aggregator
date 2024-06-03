import { createFileRoute } from "@tanstack/react-router";
import { Braces, ExternalLink } from "lucide-react";

import config from "@/lib/config";
import { Button } from "@/components/ui/button";
import { beforeLoadAuthenticated } from "@/lib/auth";
import { Trans } from "@/components";
import { indicatorKindMapping, indicatorKindExamples } from "@/lib/data";
import { TransId, useTranslation } from "@/i18n";
import { IndicatorKind } from "@/types/backendTypes";

type DocumentationBlockProps =
  | {
      id: string;
      transId: TransId;
    }
  | {
      id: TransId;
      transId?: undefined;
    };

const DocumentationBlock: React.FC<
  React.PropsWithChildren<DocumentationBlockProps>
> = ({ id, children, transId }) => (
  <div className="flex flex-col gap-2 rounded-xl border bg-muted/25 p-4 text-sm shadow transition-colors duration-500 hover:bg-muted/5">
    <h2 id={id} className="-mt-8 pb-1 pt-8 text-base font-semibold">
      <Trans id={transId ?? id} />
      <a
        href={`#${id}`}
        className="ms-2 font-normal opacity-50 transition-all hover:opacity-100"
      >
        #
      </a>
    </h2>

    {children}
  </div>
);

const DocsComponents: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-6 p-4">
      <div>
        <h1 className="-mt-4 pt-4 text-lg font-semibold" id="definitions">
          <Trans id="definitions" />
        </h1>
        <p className="text-sm">
          <Trans id="definitions.description" />
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="grid gap-4">
          <DocumentationBlock id="indicators">
            <p>
              <Trans id="definitions.indicators.0" />
            </p>
            <p>
              <Trans id="definitions.indicators.1" />
            </p>
            <ul className="ms-4 list-disc">
              {Object.entries(indicatorKindMapping).map(([key, kind]) => (
                <li key={key}>
                  <b>{kind}</b>:{" "}
                  <Trans
                    // @ts-expect-error Unsure how to properly tell typescript that this is safe or to tell it to cast to a const
                    id={`definitions.indicators.kind.descriptions.${key.toLowerCase()}`}
                  />
                  <li className="list-none">
                    <code className="break-all rounded bg-muted px-1 text-xs">
                      {indicatorKindExamples[key as IndicatorKind]}
                    </code>
                  </li>
                </li>
              ))}
            </ul>
            <p>
              <Trans id="definitions.indicators.3" />
            </p>
          </DocumentationBlock>
          <DocumentationBlock id="lists" transId="ignore.lists">
            <p>
              <Trans id="definitions.lists.0" />
            </p>
            <p>
              <Trans id="definitions.lists.1" />
            </p>
            <ol className="ms-4 list-disc">
              {([0, 1, 2] as const).map((i) => (
                <li
                  key={i}
                  dangerouslySetInnerHTML={{
                    __html: t(`definitions.lists.2.list.${i}`),
                  }}
                />
              ))}
            </ol>
          </DocumentationBlock>
          <DocumentationBlock id="config">
            <Trans id="definitions.config" />
          </DocumentationBlock>
          <DocumentationBlock id="history">
            <Trans id="definitions.history" />
          </DocumentationBlock>
        </div>

        <div className="grid gap-4">
          <DocumentationBlock id="sources">
            <p>
              <Trans id="definitions.sources.0" />
            </p>
            <p>
              <Trans id="definitions.sources.1" />
            </p>
            <ul className="ms-4 list-disc">
              {([0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const).map((i) => (
                <li key={i}>
                  <Trans id={`definitions.sources.2.list.${i}`} />
                </li>
              ))}
            </ul>
            <p
              dangerouslySetInnerHTML={{ __html: t("definitions.sources.3") }}
            />
          </DocumentationBlock>
          <DocumentationBlock id="providers">
            <p
              dangerouslySetInnerHTML={{ __html: t("definitions.providers.0") }}
            />
            <p>
              <Trans id="definitions.providers.1" />
            </p>
          </DocumentationBlock>
          <DocumentationBlock id="requests">
            <p>
              <Trans id="definitions.requests.0" />
            </p>
            <p>
              <Trans id="definitions.requests.1" />
            </p>
            <p>
              <Trans id="definitions.requests.2" />
            </p>
          </DocumentationBlock>
          <DocumentationBlock id="users">
            <p>
              <Trans id="definitions.users.0" />
            </p>
            <p>
              <Trans id="definitions.users.1" />
            </p>
            <p>
              <Trans id="definitions.users.2" />
            </p>
          </DocumentationBlock>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="-mt-4 pt-4 text-lg font-semibold"
            id="api-documentation"
          >
            <Trans id="docs.rest.api.doc.title" />
          </h1>
          <p className="text-sm">
            <Trans id="docs.rest.api.doc.description" />
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href={`${config.rest_server_base_url}/docs/openapi.json`}
            target="_blank"
            rel="noreferrer noopener"
          >
            <Button variant="ghost" size="sm" className="gap-2">
              <Braces size={16} />
              OpenAPI JSON
            </Button>
          </a>
          <a
            href={`${config.rest_server_base_url}/docs`}
            target="_blank"
            rel="noreferrer noopener"
          >
            <Button variant="secondary" size="sm" className="gap-2">
              <ExternalLink size={16} />
              <Trans id="docs.swagger.ui" />
            </Button>
          </a>
        </div>
      </div>
      <div className="overflow-hidden rounded-xl border shadow">
        <iframe
          src={`${config.rest_server_base_url}/docs`}
          width="100%"
          className="min-h-[80vh]"
        />
      </div>
    </div>
  );
};

export const Route = createFileRoute("/docs")({
  component: DocsComponents,
  beforeLoad: beforeLoadAuthenticated(),
});

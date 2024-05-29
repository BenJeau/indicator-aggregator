import { createFileRoute } from "@tanstack/react-router";
import { Braces, ExternalLink } from "lucide-react";

import config from "@/lib/config";
import { Button } from "@/components/ui/button";
import { beforeLoadAuthenticated } from "@/lib/auth";
import { Trans } from "@/components";
import { indicatorKindMapping, indicatorKindExamples } from "@/lib/data";
import { TransId } from "@/i18n";
import { IndicatorKind } from "@/types/backendTypes";

const kindDescription = {
  md5: "A MD5 hash",
  sha1: "A SHA1 hash",
  sha256: "A SHA256 hash",
  sha512: "A SHA512 hash",
  tlsh: "A SHA512 hash",
  ssdeep: "A SSDEEP hash",
  ipv4: "An IPv4 address",
  ipv6: "An IPv6 address",
  url: "A URL",
  email: "An email address",
  domain: "A domain",
};

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
  <div className="flex gap-2 flex-col border rounded-xl p-4 bg-muted/25 hover:bg-muted/5 transition-colors duration-500 shadow text-sm">
    <h2 id={id} className="font-semibold -mt-8 pt-8 pb-1 text-base">
      <Trans id={transId ?? id} />
      <a
        href={`#${id}`}
        className="transition-all hover:opacity-100 font-normal opacity-50 ms-2"
      >
        #
      </a>
    </h2>

    {children}
  </div>
);

const DocsComponents: React.FC = () => (
  <div className="p-4 flex gap-6 flex-col">
    <div>
      <h1 className="font-semibold text-lg -mt-4 pt-4" id="definitions">
        <Trans id="definitions" />
      </h1>
      <p className="text-sm">
        Are you unfamiliar with the different terms used throughout this
        application? Find below many of the main terms used.
      </p>
    </div>
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="grid gap-4">
        <DocumentationBlock id="indicators">
          <p>
            An indicator is a shorthand for an indicator of compromise (IOC)
            which is a kind of data that can be used to identify users,
            applications, events, devices, and correlate between various data
            sources.
          </p>
          <p>
            While this can range from various kinds of data, the ones by default
            here are the following:
          </p>
          <ul className="list-disc ms-4">
            {Object.entries(indicatorKindMapping).map(([key, kind]) => (
              <li>
                <b>{kind}</b>: {kindDescription[kind.toLowerCase()]}
                <li className="list-none">
                  <code className="bg-muted rounded px-1 break-all text-xs">
                    {indicatorKindExamples[key as IndicatorKind]}
                  </code>
                </li>
              </li>
            ))}
          </ul>
          <p>
            If these are not enough to represent the kind of data you are
            dealing with, you can define your own custom kinds.
          </p>
        </DocumentationBlock>
        <DocumentationBlock id="lists" transId="ignore.lists">
          <p>
            An ignore list is a list of indicators that are used to ignore
            requests containing that specific request. By itself, it doesn't
            have any impact on the rest of the system unless configured to do so
            and make sources ignore requests.
          </p>
          <p>
            There are three ways an ignore list can have an impact on the
            sources:
          </p>
          <ol className="list-disc ms-4">
            <li>
              <b>Global level</b>: all sources will use this ignore list
            </li>
            <li>
              <b>Provider level</b>: all sources under the specific provider
              with the ignore list will be affected
            </li>
            <li>
              <b>Source level</b>: only the specific source the ignore list will
              be affected
            </li>
          </ol>
        </DocumentationBlock>
        <DocumentationBlock id="config">
          The server configuration holds many important fields and actions to
          configure and toggle. Manage all your secrets and API tokens as well.
          All changes here are affected in real-time, no need to restart the
          services.
        </DocumentationBlock>
        <DocumentationBlock id="history">
          Past requests can be found in the history section of the platform. You
          can see the related data, OpenTelemetry traces, the time it was
          requested, who requested this data, and a snapshot of the sources.
        </DocumentationBlock>
      </div>

      <div className="grid gap-4">
        <DocumentationBlock id="sources">
          <p>
            A source can correlate data from an indicator. It can range from an
            external third party to a local service that performs actions to get
            data.
          </p>
          <p>
            Thanks to the platform, you can configure them via the UI or the API
            with them having the following features:
          </p>
          <ul className="list-disc ms-4">
            <li>define supported indicator kinds</li>
            <li>rate-limiting based on varying intervals</li>
            <li>secret management</li>
            <li>
              dynamic management of sources, with real-time changes to Python
              code
            </li>
            <li>ignore specific indicators</li>
            <li>view history of past requests against the source</li>
            <li>
              caching of the source's response based on the indicator for
              varying intervals
            </li>
            <li>configure periodic background tasks (e.g. to populate data)</li>
            <li>
              document the source and link to a{" "}
              <a href="#providers" className="underline text-primary">
                provider
              </a>
            </li>
            <li>enable/disable the source on a source or provider level</li>
          </ul>
          <p className="text-sm">
            Currently, for Rust-specific sources, they can't be added
            dynamically and any changes to them require a full recompilation of
            the backend. This <i>might</i> change in the future.
          </p>
        </DocumentationBlock>
        <DocumentationBlock id="providers">
          <p>
            A source provider is an aggregator of sources, defining its origin
            and related company (if any). They are used to apply general
            configurations over the sources which can <b>override</b> the
            settings set from a source.
          </p>
          <p>
            For example, if a provider is disabled, all of its sources will be
            disabled as well and all requests against them will fail. If a
            provider has a specific ignore list, then all of its sources will
            inherit this ignore list of indicators and ignore all requests from
            those indicators.
          </p>
        </DocumentationBlock>
        <DocumentationBlock id="requests">
          <p>
            To get data from sources, requests are made either via the UI or the
            API.
          </p>
          <p>
            Making a request requires at the very least the data of an
            indicator. The UI will auto-detect the kind and will query against
            all sources if none are selected. It will also return them as they
            are done executing via Server-Sent-Events (SSE) which is also a
            feature available with the API.
          </p>
          <p>
            Currently, you can only create a request with a single indicator,
            this will change in the future to support doing bulk requests
            against sources.
          </p>
        </DocumentationBlock>
        <DocumentationBlock id="users">
          <p>
            Anyone that wants to get access to the platform needs to be a user
            of the platform. Users can be created with an email and password
            with the signup page or by anyone who logs in with one of the OpenID
            providers (e.g. Google, Microsoft).
          </p>
          <p>
            By default, when a new user gets created (by one of the methods
            above) they will not have access to the platform, but there will be
            a new user created in the system. An existing user with the proper
            amount of privileges can enable them and grant them the appropriate
            roles.
          </p>
          <p>
            All action in the application needs to be authenticated by a user
            either with Basic authentication, a JWT bearer token, or an API
            token. They are linked to users and all of their actions are logged
            in the backend. These can be seen by admins.
          </p>
        </DocumentationBlock>
      </div>
    </div>
    <div className="flex justify-between items-center">
      <div>
        <h1 className="font-semibold text-lg -mt-4 pt-4" id="api-documentation">
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
    <div className="rounded-xl overflow-hidden shadow border">
      <iframe
        src={`${config.rest_server_base_url}/docs`}
        width="100%"
        className="min-h-[80vh]"
      />
    </div>
  </div>
);

export const Route = createFileRoute("/docs")({
  component: DocsComponents,
  beforeLoad: beforeLoadAuthenticated(),
});

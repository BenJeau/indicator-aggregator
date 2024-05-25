import { createFileRoute } from "@tanstack/react-router";
import { Braces, ExternalLink } from "lucide-react";

import config from "@/lib/config";
import { Button } from "@/components/ui/button";
import { beforeLoadAuthenticated } from "@/lib/auth";
import { Trans } from "@/components";

const DocsComponents: React.FC = () => (
  <div className="p-4 flex gap-4 flex-col">
    <div>
      <h1 className="font-semibold text-lg">
        <Trans id="definitions" />
      </h1>
      <p className="text-sm">
        Are you new or not familiar with the different terms used in throughout
        this application? Find below many of the main terms used.
      </p>
    </div>
    <div>
      <h2 id="indicators" className="font-semibold">
        Indicators
      </h2>
      <p className="text-sm"></p>
    </div>
    <div>
      <h2 id="sources" className="font-semibold">
        <Trans id="sources" />
      </h2>
      <p className="text-sm">A source is something that can correlate</p>
    </div>
    <div>
      <h2 id="providers" className="font-semibold">
        <Trans id="providers" />
      </h2>
      <p className="text-sm"></p>
    </div>
    <div>
      <h2 id="lists" className="font-semibold">
        <Trans id="ignore.lists" />
      </h2>
      <p className="text-sm"></p>
    </div>
    <div>
      <h2 id="requests" className="font-semibold">
        <Trans id="requests" />
      </h2>
      <p className="text-sm"></p>
    </div>
    <div>
      <h2 id="config" className="font-semibold">
        <Trans id="config" />
      </h2>
      <p className="text-sm"></p>
    </div>
    <div className="flex justify-between items-center">
      <div>
        <h1 className="font-semibold text-lg">
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
    <div className="rounded-md overflow-hidden shadow border">
      <iframe
        src={`${config.rest_server_base_url}/docs`}
        width="100%"
        className="min-h-[800px]"
      />
    </div>
  </div>
);

export const Route = createFileRoute("/docs")({
  component: DocsComponents,
  beforeLoad: beforeLoadAuthenticated(),
});

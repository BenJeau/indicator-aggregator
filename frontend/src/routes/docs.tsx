import { createFileRoute } from "@tanstack/react-router";
import { Braces, ExternalLink } from "lucide-react";

import config from "@/config";
import { Button } from "@/components/ui/button";
import { beforeLoadAuthenticated } from "@/auth";
import { Trans } from "@/components";

const DocsComponents: React.FC = () => (
  <div className="p-4 flex gap-2 flex-col">
    <h1 className="font-semibold text-lg">
      <Trans id="definitions" />
    </h1>
    <h1 id="sources" className="font-semibold">
      <Trans id="sources" />
    </h1>
    <h1 id="providers" className="font-semibold">
      <Trans id="providers" />
    </h1>
    <h1 id="lists" className="font-semibold">
      <Trans id="ignore.lists" />
    </h1>
    <h1 id="requests" className="font-semibold">
      <Trans id="requests" />
    </h1>
    <h1 id="config" className="font-semibold">
      <Trans id="config" />
    </h1>
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

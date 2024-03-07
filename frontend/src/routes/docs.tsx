import { createFileRoute } from "@tanstack/react-router";

import config from "@/config";
import { Braces, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const DocsComponents: React.FC = () => (
  <div className="p-4 flex gap-2 flex-col">
    <h1 id="sources" className="font-semibold text-lg">
      Definitions
    </h1>
    <h1 id="sources" className="font-semibold">
      Sources
    </h1>
    <h1 id="providers" className="font-semibold">
      Providers
    </h1>
    <h1 id="lists" className="font-semibold">
      Ignore lists
    </h1>
    <h1 id="requests" className="font-semibold">
      Requests
    </h1>
    <h1 id="config" className="font-semibold">
      Server config
    </h1>
    <div className="flex justify-between items-center">
      <div>
        <h1 className="font-semibold text-lg">REST API documentation</h1>
        <p className="text-sm">
          Swagger API documentation following OpenAPI specs
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
            Swagger UI
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
});

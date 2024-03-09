# REST API

The REST API of Indicator Aggregator is written in Rust using [Axum](https://github.com/tokio-rs/axum/) and documented using [utoipa](https://github.com/juhaku/utoipa) exposing OpenAPI v3 JSON specs at the `/api/v1/docs/openapi.json` endpoint or Swagger UI documentation at the `/api/v1/docs` endpoint.

## Frontend communication

Currently, the API glue needed in the frontend is manually done via types exported from [typeshare](https://github.com/1Password/typeshare). The generated types from the backend are available within the [backendTypes.ts file](../frontend/src/types/backendTypes.ts) and the APIs are defined in the [/frontend/src/api](../frontend/src/api/) directory using the browser's built-in fetch API and [@tanstack/query](https://tanstack.com/query/) for easier async state management.
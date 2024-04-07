use postgres::schemas as pg_schemas;
use sources::schemas;
use utoipa::OpenApi;
use utoipa_swagger_ui::{Config, SwaggerUi};

use crate::server::routes;

#[derive(OpenApi)]
#[openapi(
    info(
        title = "Indicator Aggregator REST API",
        description = "A [Axum](https://github.com/tokio-rs/axum) Rust based API REST endpoints for the Indicator Aggregator system interfacing with PostgreSQL via [sqlx](https://github.com/launchbadge/sqlx) and Redis for caching, background jobs, requests, and source/provider management. This documentation is generated using [utoipa](https://github.com/juhaku/utoipa).

## How to use

Select a tag (category) to reveal information about the endpoints and select an endpoint to test them. To query the API, you'll need to authenticate yourself with Keycloak below or by clicking on any of the locks.

## Authentication

Currently no authentication is required to access the API.",
        contact(
            name = "Benoît Jeaurond",
            email = "benoit@jeaurond.dev"
        ),
    ),
    servers(
        (url = "/api/v1/")
    ),
    paths(
        routes::config::get::get_config,
        routes::config::put::update_config,
        routes::favicon::get::get_favicon,
        routes::health::get::health,
        routes::ignore_lists::delete::delete_list,
        routes::ignore_lists::entries::get::get_list_entries,
        routes::ignore_lists::entries::put::put_ignore_list_entries,
        routes::ignore_lists::get::get_global_lists,
        routes::ignore_lists::get::get_list,
        routes::ignore_lists::get::get_lists,
        routes::ignore_lists::patch::patch_list,
        routes::ignore_lists::post::create_list,
        routes::ignore_lists::providers::get::get_list_providers,
        routes::ignore_lists::providers::put::put_ignore_list_providers,
        routes::ignore_lists::sources::get::get_list_sources,
        routes::ignore_lists::sources::put::put_ignore_list_sources,
        routes::notifications::get::get_notifications,
        routes::providers::delete::delete_provider,
        routes::providers::get::get_provider,
        routes::providers::get::get_providers,
        routes::providers::ignore_lists::get::get_provider_ignore_lists,
        routes::providers::ignore_lists::put::put_provider_ignore_lists,
        routes::providers::patch::patch_provider,
        routes::providers::post::create_provider,
        routes::providers::sources::get::get_provider_sources,
        routes::providers::sources::put::put_provider_sources,
        routes::requests::execute::get::request,
        routes::requests::execute::get::sse_handler,
        routes::requests::get::get_request,
        routes::requests::get::get_request_data,
        routes::requests::get::get_requests,
        routes::runners::status::get::get_runners_status_sse,
        routes::secrets::delete::delete_secret,
        routes::secrets::get::get_secret_value,
        routes::secrets::get::get_secrets,
        routes::secrets::patch::patch_secret,
        routes::secrets::post::create_secret,
        routes::sources::delete::delete_source,
        routes::sources::get::get_source,
        routes::sources::get::get_sources,
        routes::sources::ignore_lists::get::get_source_ignore_lists,
        routes::sources::ignore_lists::put::put_source_ignore_lists,
        routes::sources::patch::patch_source,
        routes::sources::post::create_source,
        routes::sources::requests::get::get_source_requests,
        routes::sources::secrets::get::get_source_secrets,
        routes::sources::secrets::put::put_source_sources,
        routes::stats::count::get::count,
        routes::stats::count::get::count_requests_by_hour,
        routes::stats::count::get::count_requests_by_kind,
        routes::stats::count::get::count_requests_by_providers,
        routes::stats::count::get::count_requests_by_sources,
    ),
    components(
        schemas(
            pg_schemas::ignore_lists::CreateIgnoreList,
            pg_schemas::ignore_lists::CreateIngoreListEntry,
            pg_schemas::ignore_lists::IgnoreList,
            pg_schemas::ignore_lists::IgnoreListEntry,
            pg_schemas::ignore_lists::UpdateIgnoreList,
            pg_schemas::indicators::Indicator,
            pg_schemas::indicators::IndicatorKind,
            pg_schemas::notifications::MinimalSource,
            pg_schemas::notifications::NotificationKind,
            pg_schemas::providers::CreateProvider,
            pg_schemas::providers::PatchProvider,
            pg_schemas::providers::Provider,
            pg_schemas::providers::ProviderWithNumSources,
            pg_schemas::requests::Request,
            pg_schemas::requests::SourceRequest,
            pg_schemas::secrets::CreateSecret,
            pg_schemas::secrets::CreateSourceSecret,
            pg_schemas::secrets::Secret,
            pg_schemas::secrets::SecretWithNumSources,
            pg_schemas::secrets::SourceSecret,
            pg_schemas::secrets::UpdateSecret,
            pg_schemas::server_config::ServerConfig,
            pg_schemas::server_config::ServerConfigCategory,
            pg_schemas::server_config::ServerConfigEntryBool,
            pg_schemas::server_config::ServerConfigEntryString,
            pg_schemas::server_config::ServerConfigEntryU32,
            pg_schemas::server_config::ServerConfigKind,
            pg_schemas::server_config::UpdateServerConfig,
            pg_schemas::sources::CreateSource,
            pg_schemas::sources::Source,
            pg_schemas::sources::SourceKind,
            pg_schemas::sources::UpdateSource,
            pg_schemas::stats::Count,
            pg_schemas::stats::CountPerHour,
            pg_schemas::stats::CountPerId,
            pg_schemas::stats::CountPerIdWrapper,
            schemas::Data,
            schemas::DataCache,
            schemas::DataCacheAction,
            schemas::DataSource,
            schemas::DataTiming,
            schemas::RequestExecuteParam,
            schemas::SourceError,
        )
    ),
    tags(
        (name = "config", description = "Server configuration management"),
        (name = "favicon", description = "Favicon middleman fetcher for external URLs"),
        (name = "health", description = "Overall health check for the service"),
        (name = "ignoreLists", description = "Ignore list management"),
        (name = "notifications", description = "Notifications about misconfigured sources and providers"),
        (name = "providers", description = "Source providers management"),
        (name = "requests", description = "Execute requests to sources"),
        (name = "runners", description = "Background task runners management"),
        (name = "secrets", description = "Secrets management for sources"),
        (name = "sources", description = "Sources management"),
        (name = "stats", description = "General statistics about the service")
    )
)]
struct ApiDoc;

pub fn swagger_router() -> SwaggerUi {
    SwaggerUi::new("/api/v1/docs")
        .url("/api/v1/docs/openapi.json", ApiDoc::openapi())
        .config(
            Config::default()
                .try_it_out_enabled(true)
                .filter(true)
                .use_base_layout()
                .doc_expansion("none")
                .show_common_extensions(true)
                .request_snippets_enabled(true)
                .persist_authorization(true),
        )
}

use database::schemas as db_schemas;
use sources::schemas as sources_schemas;
use utoipa::OpenApi;
use utoipa_swagger_ui::{Config, SwaggerUi};

use crate::{routes, schemas};

#[derive(OpenApi)]
#[openapi(
    info(
        title = "Indicator Aggregator REST API",
        description = "A [Axum](https://github.com/tokio-rs/axum) Rust based API REST endpoints for the Indicator Aggregator system interfacing with PostgreSQL via [sqlx](https://github.com/launchbadge/sqlx) and Redis for caching, background jobs, requests, and source/provider management. This documentation is generated using [utoipa](https://github.com/juhaku/utoipa).

## How to use

Select a tag (category) to reveal information about the endpoints and select an endpoint to test them. To query the API, you'll need to authenticate yourself with Keycloak below or by clicking on any of the locks.

## Authentication

All endpoints are protected except for auth endpoints. You either need to provide a JWT as a bearer token `Bearer TOKEN`, username + password as basic authentication `Basic base64(username:password)`, or an API token `Token TOKEN` in the Authorization header.",
        contact(
            name = "Benoît Jeaurond",
            email = "benoit@jeaurond.dev"
        ),
    ),
    servers(
        (url = "/api/v1/")
    ),
    paths(
        routes::api_tokens::delete::delete_api_tokens,
        routes::api_tokens::patch::update_api_tokens,
        routes::api_tokens::post::create_api_tokens,
        routes::api_tokens::post::regenerate_api_tokens,
        routes::auth::login::post::login,
        routes::auth::openid::google::get::google_auth_redirect_callback,
        routes::auth::openid::google::get::google_redirect_login,
        routes::auth::openid::microsoft::get::microsoft_auth_redirect_callback,
        routes::auth::openid::microsoft::get::microsoft_redirect_login,
        routes::auth::signup::post::signup,
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
        routes::ignore_lists::slugs::get::get_ignore_list_id_from_slug,
        routes::ignore_lists::sources::get::get_list_sources,
        routes::ignore_lists::sources::put::put_ignore_list_sources,
        routes::indicator_kinds::get::get_indicator_kinds,
        routes::notifications::get::get_notifications,
        routes::providers::delete::delete_provider,
        routes::providers::get::get_provider,
        routes::providers::get::get_providers,
        routes::providers::ignore_lists::get::get_provider_ignore_lists,
        routes::providers::ignore_lists::put::put_provider_ignore_lists,
        routes::providers::patch::patch_provider,
        routes::providers::post::create_provider,
        routes::providers::slugs::get::get_provider_id_from_slug,
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
        routes::sources::slugs::get::get_source_id_from_slug,
        routes::stats::count::get::count,
        routes::stats::count::get::count_requests_by_hour,
        routes::stats::count::get::count_requests_by_kind,
        routes::stats::count::get::count_requests_by_providers,
        routes::stats::count::get::count_requests_by_sources,
        routes::users::delete::delete_api_tokens,
        routes::users::get::get_user,
        routes::users::get::get_user_api_tokens,
        routes::users::get::get_user_logs,
        routes::users::get::get_users,
        routes::users::patch::update_user,
    ),
    components(
        schemas(
            auth::openid::RedirectCallbackQuery,
            auth::openid::RedirectLoginQuery,
            db_schemas::IdSlug,
            db_schemas::api_tokens::ApiToken,
            db_schemas::api_tokens::CreateApiToken,
            db_schemas::api_tokens::UpdateApiToken,
            db_schemas::ignore_lists::CreateIgnoreList,
            db_schemas::ignore_lists::CreateIngoreListEntry,
            db_schemas::ignore_lists::IgnoreList,
            db_schemas::ignore_lists::IgnoreListEntry,
            db_schemas::ignore_lists::UpdateIgnoreList,
            db_schemas::indicators::Indicator,
            db_schemas::indicators::IndicatorKind,
            db_schemas::notifications::MinimalSource,
            db_schemas::notifications::NotificationKind,
            db_schemas::providers::CreateProvider,
            db_schemas::providers::PatchProvider,
            db_schemas::providers::Provider,
            db_schemas::requests::Request,
            db_schemas::requests::SourceRequest,
            db_schemas::secrets::CreateSecret,
            db_schemas::secrets::CreateSourceSecret,
            db_schemas::secrets::Secret,
            db_schemas::secrets::SecretWithNumSources,
            db_schemas::secrets::SourceSecret,
            db_schemas::secrets::UpdateSecret,
            db_schemas::server_config::ServerConfig,
            db_schemas::server_config::ServerConfigCategory,
            db_schemas::server_config::ServerConfigEntryBool,
            db_schemas::server_config::ServerConfigEntryString,
            db_schemas::server_config::ServerConfigEntryU32,
            db_schemas::server_config::ServerConfigKind,
            db_schemas::server_config::UpdateServerConfig,
            db_schemas::sources::CreateSource,
            db_schemas::sources::Source,
            db_schemas::sources::SourceKind,
            db_schemas::sources::UpdateSource,
            db_schemas::stats::Count,
            db_schemas::stats::CountPerHour,
            db_schemas::stats::CountPerId,
            db_schemas::stats::CountPerIdWrapper,
            db_schemas::users::DbUserLog,
            db_schemas::users::UpdateUser,
            db_schemas::users::User,
            db_schemas::users::UserWithNumLogs,
            routes::auth::openid::google::get::GoogleCallbackContent,
            schemas::CreatedApiToken,
            schemas::Data,
            schemas::DataCache,
            schemas::DataCacheAction,
            schemas::DataSource,
            schemas::DataTiming,
            schemas::LoginUserRequest,
            schemas::LoginUserResponse,
            schemas::RequestExecuteParam,
            schemas::SignupUserRequest,
            sources_schemas::SourceError,
        )
    ),
    tags(
        (name = "apiTokens", description = "Authentication API token management"),
        (name = "auth", description = "Authentication endpoints"),
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
        (name = "stats", description = "General statistics about the service"),
        (name = "users", description = "User management"),
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

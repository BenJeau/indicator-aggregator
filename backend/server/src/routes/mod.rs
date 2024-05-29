use axum::{
    middleware::{from_fn, from_fn_with_state},
    Router,
};
use shared::tower::CommonTowerLayerBuilder;

use crate::ServerState;

pub mod api_tokens;
pub mod auth;
pub mod config;
pub mod favicon;
pub mod health;
pub mod ignore_lists;
pub mod indicator_kinds;
mod middleware;
pub mod notifications;
mod openapi;
pub mod providers;
pub mod requests;
pub mod runners;
pub mod secrets;
pub mod server;
pub mod sources;
pub mod stats;
pub mod users;

pub fn router(state: ServerState) -> Router {
    let layers = CommonTowerLayerBuilder::new().build();

    let router = Router::new()
        .merge(openapi::swagger_router())
        .route_layer(from_fn(openapi::swagger_inject_dark_styles))
        .nest(
            "/api/v1",
            Router::new()
                .nest("/apiTokens", api_tokens::router())
                .nest("/config", config::router())
                .nest("/favicon", favicon::router())
                .nest("/health", health::router())
                .nest("/ignoreLists", ignore_lists::router())
                .nest("/indicatorKinds", indicator_kinds::router())
                .nest("/notifications", notifications::router())
                .nest("/providers", providers::router())
                .nest("/requests", requests::router())
                .nest("/runners", runners::router())
                .nest("/secrets", secrets::router())
                .nest("/sources", sources::router())
                .nest("/stats", stats::router())
                .nest("/users", users::router())
                .route_layer(from_fn_with_state(
                    state.clone(),
                    middleware::auth_middleware,
                ))
                .nest("/auth", auth::router())
                .with_state(state),
        );

    layers.apply_middlewares(router)
}

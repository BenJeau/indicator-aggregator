use axum::Router;
use shared::tower::CommonTowerLayerBuilder;

use crate::ServerState;

pub mod config;
pub mod favicon;
pub mod health;
pub mod ignore_lists;
pub mod notifications;
mod openapi;
pub mod providers;
pub mod requests;
pub mod runners;
pub mod secrets;
pub mod sources;
pub mod stats;

pub fn router(state: ServerState) -> Router {
    let layers = CommonTowerLayerBuilder::new().build();

    let router = Router::new().merge(openapi::swagger_router()).nest(
        "/api/v1",
        Router::new()
            .nest("/config", config::router())
            .nest("/favicon", favicon::router())
            .nest("/health", health::router())
            .nest("/ignoreLists", ignore_lists::router())
            .nest("/notifications", notifications::router())
            .nest("/providers", providers::router())
            .nest("/requests", requests::router())
            .nest("/runners", runners::router())
            .nest("/secrets", secrets::router())
            .nest("/sources", sources::router())
            .nest("/stats", stats::router())
            .with_state(state),
    );

    layers.apply_middlewares(router)
}

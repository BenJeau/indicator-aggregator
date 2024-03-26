use axum::{routing::get, Router};

use crate::ServerState;

pub mod execute;

pub mod get;

pub fn router() -> Router<ServerState> {
    Router::new()
        .route("/", get(get::get_requests))
        .route("/:id", get(get::get_request))
        .route("/:id/history", get(get::get_request_data))
        .nest("/execute", execute::router())
}

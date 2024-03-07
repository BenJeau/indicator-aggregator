use axum::{routing::get, Router};

use crate::ServerState;

pub mod get;

pub fn router() -> Router<ServerState> {
    Router::new()
        .route("/", get(get::request))
        .route("/sse", get(get::sse_handler))
}

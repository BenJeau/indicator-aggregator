use axum::{routing::get, Router};

use crate::ServerState;

pub mod get;

pub fn router() -> Router<ServerState> {
    let requests_router = Router::new()
        .route("/sources", get(get::count_requests_by_sources))
        .route("/providers", get(get::count_requests_by_providers))
        .route("/", get(get::count_requests_by_hour));

    Router::new()
        .route("/", get(get::count))
        .nest("/requests", requests_router)
}

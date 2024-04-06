use axum::{routing::get, Router};

use crate::ServerState;

pub mod get;

pub fn router() -> Router<ServerState> {
    Router::new().route("/sse", get(get::get_runners_status_sse))
}

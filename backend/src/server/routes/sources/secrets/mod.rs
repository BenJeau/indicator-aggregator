use axum::{routing::get, Router};

use crate::ServerState;

pub mod get;
pub mod put;

pub fn router() -> Router<ServerState> {
    Router::new().route(
        "/",
        get(get::get_source_secrets).put(put::put_source_sources),
    )
}

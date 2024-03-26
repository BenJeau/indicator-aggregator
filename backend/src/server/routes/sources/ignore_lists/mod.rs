use axum::{routing::get, Router};

use crate::ServerState;

pub mod get;
pub mod put;

pub fn router() -> Router<ServerState> {
    Router::new().route(
        "/",
        get(get::get_source_ignore_lists).put(put::put_source_ignore_lists),
    )
}

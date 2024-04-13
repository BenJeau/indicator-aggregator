use axum::{routing::get, Router};

use crate::ServerState;

pub mod get;
pub mod put;

pub fn router() -> Router<ServerState> {
    Router::new().route(
        "/",
        get(get::get_list_providers).put(put::put_ignore_list_providers),
    )
}
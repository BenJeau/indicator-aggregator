use axum::Router;

use crate::ServerState;

pub mod status;

pub fn router() -> Router<ServerState> {
    Router::new().nest("/status", status::router())
}

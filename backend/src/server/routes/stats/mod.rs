use axum::Router;

use crate::ServerState;

pub mod count;

pub fn router() -> Router<ServerState> {
    Router::new().nest("/count", count::router())
}

use axum::Router;

use crate::ServerState;

pub mod openid;

pub fn router() -> Router<ServerState> {
    Router::new().nest("/openid", openid::router())
}

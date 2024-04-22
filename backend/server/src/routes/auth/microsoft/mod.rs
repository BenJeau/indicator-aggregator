use axum::{routing::get, Router};

use crate::ServerState;

pub mod get;

pub fn router() -> Router<ServerState> {
    Router::new()
        .route("/", get(get::microsoft_redirect_login))
        .route("/redirect", get(get::microsoft_auth_redirect_callback))
}

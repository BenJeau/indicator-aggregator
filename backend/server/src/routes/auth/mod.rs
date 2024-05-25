use axum::{routing::get, Router};

use crate::ServerState;

pub mod get;

pub mod login;
pub mod openid;
pub mod signup;

pub fn router() -> Router<ServerState> {
    Router::new()
        .route("/", get(get::get_enabled_auth))
        .nest("/login", login::router())
        .nest("/openid", openid::router())
        .nest("/signup", signup::router())
}

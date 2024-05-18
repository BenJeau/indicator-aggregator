use axum::Router;

use crate::ServerState;

pub mod login;
pub mod openid;
pub mod signup;

pub fn router() -> Router<ServerState> {
    Router::new()
        .nest("/login", login::router())
        .nest("/openid", openid::router())
        .nest("/signup", signup::router())
}

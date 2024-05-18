use axum::{routing::post, Router};

use crate::ServerState;

pub mod post;

pub fn router() -> Router<ServerState> {
    Router::new().route("/", post(post::login))
}

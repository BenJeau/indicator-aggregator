use axum::{routing::get, Router};

use crate::ServerState;

pub mod get;
pub mod patch;

pub fn router() -> Router<ServerState> {
    Router::new()
        .route("/", get(get::get_users))
        .route("/:id/logs", get(get::get_user_logs))
        .route("/:id", get(get::get_user).patch(patch::update_user))
}

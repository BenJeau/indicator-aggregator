use axum::{
    routing::{delete, post},
    Router,
};

use crate::ServerState;

pub mod delete;
pub mod patch;
pub mod post;

pub fn router() -> Router<ServerState> {
    Router::new()
        .route("/", post(post::create_api_tokens))
        .route(
            "/:id",
            delete(delete::delete_api_tokens).patch(patch::update_api_tokens),
        )
        .route("/:id/regenerate", post(post::regenerate_api_tokens))
}
